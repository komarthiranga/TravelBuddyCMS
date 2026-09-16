import { ImageResponse } from 'next/og'
export async function GET() {
    return new ImageResponse(
        <div style={{display:'flex',flexDirection:'column',justifyContent:'center',width:'100%',height:'100%',background:'#f5f7f2',padding:80,color:'#173d38'}}>
            <div style={{display:'flex',fontSize:32,color:'#155e57'}}>TravelBuddy</div>
            <div style={{display:'flex',fontSize:76,fontWeight:700,marginTop:30}}>A new city. A local friend.</div>
            <div style={{display:'flex',fontSize:30,marginTop:32,color:'#47635e'}}>Places to explore · Food · Stays · Directions</div>
            <div style={{display:'flex',marginTop:40,width:120,height:8,borderRadius:4,background:'#c17b36'}} />
        </div>, {width:1200,height:630},
    )
}
