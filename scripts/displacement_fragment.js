varying vec2 vUv;

uniform sampler2D tHeightMap;
uniform float uSmoke;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uScreenHeight;

void main( void ) {


	vec4 heightColor = texture2D( tHeightMap, vUv);

	vec3 gradient1 = uColor1/(gl_FragCoord.y/uScreenHeight*4.0);
	vec3 gradient2 = uColor2/(gl_FragCoord.y/uScreenHeight*4.0);
	vec3 fireSumColor = (gradient1+gradient2)*heightColor.r;

	//smoke
	gl_FragColor = vec4(mix( fireSumColor, vec3(1.0), gl_FragCoord.y/uScreenHeight*uSmoke ),1.0);

	float depth = gl_FragCoord.z / gl_FragCoord.w;
	float fogFactor = smoothstep( 200.0, 400.0, depth );

	gl_FragColor = mix( gl_FragColor, vec4( vec3(0.0,0.0,0.0), gl_FragColor.w ), fogFactor )*1.0;

}