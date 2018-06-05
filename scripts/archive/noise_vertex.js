
varying vec2 vUv;
uniform vec2 scale;

void main( void ) {
	vUv = uv * scale;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}