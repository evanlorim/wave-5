#ifdef GL_ES
precision mediump float;
#endif

#define M_PI 3.1415926535897932384626433832795
#define M_2PI M_PI * 2.
#define M_HPI M_PI / 2.
#define M_E exp(1.)

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

uniform float u_amplitude;
uniform float u_pshift;
uniform float u_frequency;
uniform float u_vshift;
uniform float u_ratio;
uniform float u_decay;
uniform float u_exponent;

float rand(float x) {
  return fract(sin(x)*100000.0);
}

float sine(float x) {
  float b = u_frequency * M_2PI;
	float c = u_pshift * M_2PI;
	return u_amplitude * sin((x * b) + c) + u_vshift;
}

float square(float x) {
	float b = u_frequency * 1.;
	float c = u_pshift * 1.;
	return u_amplitude * floor(fract((x * b) + c) + .5) + u_vshift;
}

float sawtooth(float x) {
	float b = u_frequency * 1.;
	float c = u_pshift * 1.;
	return u_amplitude * fract((x * b) + c) + u_vshift;
}

float triangle(float x) {
	float b = u_frequency * 1.;
	float c = u_pshift * 1.;
	return u_amplitude * abs(2.0 * fract((x * b) + c) - 1.0) + u_vshift;
}

float pulse(float x) {
	float b = u_frequency * 1.;
	float c = u_pshift * 1.;
	return u_amplitude * floor(fract((x * b) + c) - u_ratio) + u_vshift;

}

float noise(float x) {
	float b = u_frequency * M_2PI;
	float c = u_pshift * M_2PI;
	float i = floor((x * b) + c);
	float f = fract((x * b) + c);
	return u_amplitude * mix(rand(i), rand(i + 1.0), smoothstep(0.,1.,f)) + u_vshift;
}

float dampedSine(float x) {
	float b = u_frequency * M_2PI;
	float c = u_pshift * M_2PI;
	return ((u_amplitude * pow(M_E, -1.0 * u_decay * x)) * (cos((b * x) + c))) + u_vshift;
}

float sineIn(float x) {
	float b = u_frequency * M_HPI;
	float c = u_pshift * M_HPI;
	return 1. - (u_amplitude * cos(mod((x * b) + c, M_HPI)) + u_vshift);
}

float sineOut(float x) {
	float b = u_frequency * M_HPI;
	float c = u_pshift * M_HPI;
	return u_amplitude * sin(mod((x * b) + c, M_HPI)) + u_vshift;
}

float sineInOut(float x) {
	float b = u_frequency * M_HPI;
	float c = u_pshift * M_PI;
	return (1. - (u_amplitude * cos(mod((x * b) + c, M_PI)) + u_vshift))/2.;
}

float polyIn(float x) {
	float b = u_frequency * 1.;
	float c = u_pshift * 1.;
	float inner = fract(x * b + c);
	return u_amplitude * clamp(pow(inner,u_exponent),0.,1.) + u_vshift;
}

float polyOut(float x) {
	float b = u_frequency * 1.;
  	float c = u_pshift * 1.;
	float inner = fract(x * b + c);
	return u_amplitude * clamp((1. - pow(1.- inner, u_exponent)),0.,1.) + u_vshift + u_amplitude;
}

float polyInOut(float x) {
	float b = u_frequency * 1.;
	return (mod(x,b) <= 1./(2.*b)) ? polyIn(x*2.) : polyOut(x*2.);
} 


void main(){
    vec2 st = gl_FragCoord.xy/u_resolution.xy; // adjust to square
	vec2 pos = vec2(0.5) - st;
	vec2 rt = vec2(length(pos)*2.,atan(pos.y,pos.x)); // radius & theta
	vec2 n_rt = vec2(rt.x, rt.y / M_2PI); // normalized radius & theta

	float mx = polyIn(n_rt.y);
	float fx = (n_rt.x - .5) - mx;

	float f = step(0.,fx);

	vec3 color = vec3(f);
	
	gl_FragColor = vec4(color,1.);
}
