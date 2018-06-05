uniform float time;
uniform vec2 scale;
uniform float uTwist;
varying vec2 vUv;
varying vec3 vNormal;
uniform vec2 uShapeBias;
uniform float uTurbulence;
	
#ifdef VERTEX_TEXTURES
	uniform sampler2D tHeightMap;
	uniform float uDisplacementScale;
	uniform float uDisplacementBias;
#endif

vec4 DoTwist( vec4 pos, float t )
{
	float st = sin(t);
	float ct = cos(t);
	vec4 new_pos;

	new_pos.x = pos.x*ct - pos.z*st;
	new_pos.z = pos.x*st + pos.z*ct;

	new_pos.y = pos.y;
	new_pos.w = pos.w;

	return( new_pos );
}

void main( void ) {

	vUv = uv;
	vNormal = normalize( normalMatrix * normal );

	//change matrix
	vec4 mPosition = objectMatrix *  vec4( position, 1.0 );

	mPosition.x *= 1.0 - uShapeBias.x*(1.0-vUv.y);
	mPosition.y *= 1.0-(vUv.y-0.5)*uShapeBias.y;
	//mPosition.y -= 40.0;

	float turbFactor = uTurbulence*(vUv.y-0.5);

	//shape turbulance
	mPosition.x += sin(mPosition.y/100.0 + time*20.0 )*turbFactor;
	mPosition.z += cos(mPosition.y/100.0 + time*20.0 )*turbFactor;

	//twist
	float angle_rad = uTwist * 3.14159 / 180.0;
	float height = -300.0;
	float ang = (position.y-height*0.5)/height * angle_rad;

	vec4 twistedPosition = DoTwist(mPosition, ang);
	vec4 twistedNormal = DoTwist(vec4(vNormal,1.0), ang);

	//change matrix
	vec4 mvPosition = viewMatrix * twistedPosition;

	#ifdef VERTEX_TEXTURES
		vec3 dv = texture2D( tHeightMap, vUv ).xyz;
		float df = uDisplacementScale * dv.x + uDisplacementBias;
		vec4 displacedPosition = vec4( twistedNormal.xyz * df, 0.0 ) + mvPosition;
		gl_Position = projectionMatrix * displacedPosition;
	#else
		gl_Position = projectionMatrix * mvPosition;
	#endif

}