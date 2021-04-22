const vertexShader = `#version 300 es
in vec4 vPosition;
void main() {
	gl_Position = vPosition;
}
`;
export default vertexShader;
