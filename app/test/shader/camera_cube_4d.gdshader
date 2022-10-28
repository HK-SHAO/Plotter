shader_type canvas_item;

uniform float ratio = 1.0;
uniform vec3 camera_position;
uniform mat3 camera_rotation;

vec2 fixedUV(vec2 uv, float r) {
	vec2 p = 2.0*vec2(1. - uv.x, uv.y) - 1.0;
	if (r > 1.0){
		p = vec2(p.x, p.y*r);
	} else {
		p = vec2(p.x/r, p.y);
	}
	return p;
}

void vertex() {
	UV = fixedUV(UV, ratio);
}

// Created by inigo quilez - iq/2018
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0

// Another 4D cube. For the 4D->3D projection, you can switch
// between orthographic and perspective projections, in line 12.

// See https://www.shadertoy.com/view/ftcyW4 for an example of
// rendering faces rather than edges.

// 0 = orthographics
// 1 = perspective
#define PROJECTION 1


//------------------------------------------------------------------
// capsule functions
//-------------------------------------------------------------------

// intersection
float iCapsule( in vec3 ro, in vec3 rd, in vec3 pa, in vec3 pb, in float r )
{
    vec3  ba = pb - pa;
    vec3  oa = ro - pa;

    float baba = dot(ba,ba);
    float bard = dot(ba,rd);
    float baoa = dot(ba,oa);
    float rdoa = dot(rd,oa);
    float oaoa = dot(oa,oa);

    float a = baba      - bard*bard;
    float b = baba*rdoa - baoa*bard;
    float c = baba*oaoa - baoa*baoa - r*r*baba;
    float h = b*b - a*c;
    if( h>=0.0 )
    {
        float t = (-b-sqrt(h))/a;

        float y = baoa + t*bard;
        
        // body
        if( y>0.0 && y<baba ) return t;

        // caps
        vec3 oc = (y<=0.0) ? oa : ro - pb;
        b = dot(rd,oc);
        c = dot(oc,oc) - r*r;
        h = b*b - c;
        if( h>0.0 )
        {
            return -b - sqrt(h);
        }
    }
    return -1.0;
}

// distance
vec3 dCapsule( in vec3 ro, in vec3 rd, vec3 pa, vec3 pb, float rad )
{
    vec3 ba = pb - pa;
    vec3 oa = ro - pa;
	
    float oad  = dot( oa, rd );
    float dba  = dot( rd, ba );
    float baba = dot( ba, ba );
    float oaba = dot( oa, ba );
	
    vec2 th = vec2( -oad*baba + dba*oaba, oaba - oad*dba ) / (baba - dba*dba);
	
    th.x = max(   th.x, 0.0 );
    th.y = clamp( th.y, 0.0, 1.0 );
	
    vec3 p = pa + ba*th.y;
    vec3 q = ro + rd*th.x;
	
    return vec3( length( p-q )-rad, th );
}

// normal
vec3 nCapsule( in vec3 p, in vec3 a, in vec3 b, in float r )
{
    vec3 ba = b-a, pa = p-a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return (pa - h*ba)/r;
}

//-------------------------------------------------------------------

//-------------------------------------------------------------------

const float rad = 0.08;

float intersect( in vec3 ro, in vec3 rd, in vec3 v[16], out ivec2 oObject )
{
    float tmp;
    
    float res = 1e10;

    for( int i=0; i<16; i++ ) // for each vertex
    for( int j=0; j< 4; j++ ) // connect it to its 4 neighbors
    {
        int a = i;
        int b = i ^ (1<<j); // change one bit/dimension
        if( a<b )          // skip edge if already visited
        {
            tmp = iCapsule( ro, rd, v[a], v[b], rad );
            if( tmp>0.0 && tmp<res )
            {
                res = tmp; 
                oObject = ivec2(a,b);
            }
        }
    }

    return (res<1e9)?res:-1.0;
}

vec3 calcNormal( in vec3 pos, in vec3 v[16], in ivec2 obj )
{
    return nCapsule( pos, v[obj.x], v[obj.y], rad );
}

float softShadowCapsule( in vec3 ro, in vec3 rd, in vec3 a, in vec3 b, in float r )
{
    const float k = 16.0;
    vec3 t = dCapsule( ro, rd, a, b, r );
    return clamp( k*t.x/max(t.z,0.0001), 0.0, 1.0 );
}

float calcShadow( in vec3 ro, in vec3 rd, in vec3 v[16] )
{
    float t = 1.0;
    
    for( int i=0; i<16; i++ ) // for each vertex
    for( int j=0; j< 4; j++ ) // connect it to its 4 neighbors
    {
        int a = i;
        int b = i ^ (1<<j); // change one bit/dimension
        if( a<b )           // skip edge if already visited
        {
            t = min( t, softShadowCapsule( ro, rd, v[a], v[b], rad ) );
        }
    }

    return t;
}

vec4 render( in vec3 ro, in vec3 rd, in float seed, in vec3 v[16] )
{ 
    // vec3 col = vec3(0.04) + 0.03*rd.y;
	vec4 col = vec4(0.0);

    ivec2 obj;
    float t = intersect(ro,rd,v,obj);
    if( t > 0.0 )
    {
		col = vec4(1.0);
        vec3 pos = ro + t*rd;
        vec3 nor = calcNormal( pos, v, obj );
            
        
        // material        
        col.rgb = vec3(0.4);

        // lighting        
        float occ = 0.7+0.3*nor.y;
        vec3  lig = normalize( vec3(0.4, 0.8, 0.6) );
        vec3  hal = normalize( lig-rd );
        float amb = clamp( 0.5+0.5*nor.y, 0.0, 1.0 );
        float dif = clamp( dot( nor, lig ), 0.0, 1.0 );
        float fre = pow( clamp(1.0+dot(nor,rd),0.0,1.0), 2.0 );
        
        float sha = (dif>0.001) ? calcShadow( pos+0.02*nor, lig, v ) : 0.0;

        float spe = pow( clamp( dot(nor,hal), 0.0, 1.0 ),16.0)*dif*sha*
                    (0.04 + 0.96*pow( clamp(1.0+dot(hal,rd),0.0,1.0), 5.0 ));

        vec3 lin = vec3(0.0);
        lin += 1.5*dif*vec3(1.10,0.80,0.70)*sha;
        lin += 0.5*amb*vec3(0.70,0.80,1.00)*occ;
        lin += 1.0*fre*vec3(1.20,1.10,1.00)*occ*(0.1+0.9*sha*dif);
        col.rgb = col.rgb*lin;
        col.rgb += 15.00*spe*vec3(1.00,0.90,0.70);
    }
   
    
    return col;
}

mat2 rot( float a )
{
    float c = cos(a);
    float s = sin(a);
    return mat2(vec2(c,s), vec2(-s,c));
}

vec3 transform( in vec4 p )
{
    #if PROJECTION==0
    p.yz = rot( TIME*0.13+1.0)*p.yz;
    #endif
    p.zw = rot(-TIME*1.0+0.0)*p.zw;
    
    #if PROJECTION==0
    return p.xyz;               // orthogonal projection
    #else
    return 3.0*p.xyz/(3.0+p.w); // perspective projection
    #endif
}

vec4 Grid(vec3 ro, vec3 rd) {
	float d = -ro.y/rd.y;
    
    if (d <= 0.0) return vec4(0.0);
    
   	vec2 p = (ro.xz + rd.xz*d);
    
    vec2 e = min(vec2(2.0), fwidth(p));
    
    vec2 l = smoothstep(vec2(1.0), 1.0 - e, fract(p)) + smoothstep(vec2(0.0), e, fract(p)) - (1.0 - e);

    return mix(vec4(vec3(0.4), 1.0), vec4(vec3(0.8), 0.0) * (l.x + l.y) * 0.5, exp(-d*0.01));
}

void fragment() {
	vec2 uv = UV;
    // rotate 4D cube
    vec3 v[16] = vec3[16](
							transform(vec4(-1,-1,-1,-1)),
							transform(vec4(-1,-1,-1, 1)),
							transform(vec4(-1,-1, 1,-1)),
							transform(vec4(-1,-1, 1, 1)),
							transform(vec4(-1, 1,-1,-1)),
							transform(vec4(-1, 1,-1, 1)),
							transform(vec4(-1, 1, 1,-1)),
							transform(vec4(-1, 1, 1, 1)),
							transform(vec4( 1,-1,-1,-1)),
							transform(vec4( 1,-1,-1, 1)),
							transform(vec4( 1,-1, 1,-1)),
							transform(vec4( 1,-1, 1, 1)),
							transform(vec4( 1, 1,-1,-1)),
							transform(vec4( 1, 1,-1, 1)),
							transform(vec4( 1, 1, 1,-1)),
							transform(vec4( 1, 1, 1, 1))
						);
    
	vec3 ro = camera_position;
	mat3 ca = camera_rotation;

    vec4 tot = vec4(0.0);

    vec2 p = uv;


    float seed =  FRAGCOORD.x + FRAGCOORD.y*131.1 + TIME;

    // ray direction
    vec3 rd = ca * normalize( -vec3(p.xy, 1.0) );

    // render	
    vec4 col = render( ro, rd, seed, v );

    // gamma
    col.rgb = pow( col.rgb, vec3(0.4545) );

	tot += Grid(ro, rd);

	if (col.a > 0.01) {
		tot = col;
	}

    // cheap dither to remove banding from background
    tot.rgb += 0.5*sin(FRAGCOORD.x)*sin(FRAGCOORD.y)/256.0;


    COLOR = tot;
}