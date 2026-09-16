import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import ts from 'typescript'

async function moduleFrom(file, requireStub) {
    const source = await fs.readFile(file, 'utf8')
    const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } })
    const module = { exports: {} }
    new Function('require', 'module', 'exports', outputText)(requireStub, module, module.exports)
    return module.exports
}
const crypto = await import('node:crypto')
const credentials = await moduleFrom('src/lib/cms-credentials.ts', () => crypto)
const env = { CMS_ADMIN_USERNAME: 'editor', CMS_ADMIN_PASSWORD: crypto.randomBytes(32).toString('hex') }
const authorization = 'Basic ' + Buffer.from(`${env.CMS_ADMIN_USERNAME}:${env.CMS_ADMIN_PASSWORD}`).toString('base64')

test('only exact credentials work; unconfigured, weak, malformed and forged input fail closed', () => {
    assert.equal(credentials.validCmsCredentials(authorization, env), true)
    for (const header of [null, '', 'Bearer admin', 'Basic !!!', 'Basic ' + 'a'.repeat(1500), authorization.slice(0, -4), 'Basic ' + Buffer.from('admin:wrong').toString('base64')]) {
        assert.equal(credentials.validCmsCredentials(header, env), false)
    }
    assert.equal(credentials.validCmsCredentials(authorization, {}), false)
    assert.equal(credentials.cmsConfigured({ ...env, CMS_ADMIN_PASSWORD: 'password' }), false)
    assert.equal(credentials.cmsConfigured({ ...env, CMS_ADMIN_USERNAME: 'bad:name' }), false)
    assert.equal(credentials.validCmsCredentials(authorization, { ...env, CMS_ADMIN_PASSWORD: crypto.randomBytes(32).toString('hex') }), false)
})

test('server guard checks real authorization and does not accept role headers', async () => {
    const guard = await moduleFrom('src/lib/cms-auth.ts', name => {
        if (name === 'server-only') return {}
        if (name === 'next/headers') return { headers: async () => new Headers({ 'x-cms-admin': 'true' }) }
        if (name === './cms-credentials') return credentials
        throw new Error('Unexpected dependency')
    })
    await assert.rejects(guard.requireCmsAdmin(), /Administrator authentication required/)
})

async function files(dir) {
    const result = []
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
        const path = `${dir}/${entry.name}`
        if (entry.isDirectory()) result.push(...await files(path))
        else if (path.endsWith('.ts')) result.push(path)
    }
    return result
}

test('every exported CMS async function refuses access before touching data or validating input', async () => {
    let checked = 0
    for (const file of await files('src/master')) {
        const source = await fs.readFile(file, 'utf8')
        const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true)
        const functions = ast.statements.filter(n => ts.isFunctionDeclaration(n) && n.body
            && n.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)
            && n.modifiers.some(m => m.kind === ts.SyntaxKind.AsyncKeyword))
        if (!functions.length) continue
        const denied = new Error('denied-before-data')
        const exports = await moduleFrom(file, name => name === '@/lib/cms-auth'
            ? { requireCmsAdmin: async () => { throw denied } }
            : new Proxy({}, { get() { throw new Error(`Touched dependency before authentication: ${name}`) } }))
        for (const fn of functions) {
            await assert.rejects(exports[fn.name.text](), error => error === denied, `${file}:${fn.name.text}`)
            checked++
        }
    }
    assert.equal(checked, 34)
})
