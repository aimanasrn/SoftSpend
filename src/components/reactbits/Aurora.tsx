import { useEffect, useRef } from 'react'
import { Color, Mesh, Program, Renderer, Triangle } from 'ogl'

const VERTEX = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`

const FRAGMENT = `#version 300 es
precision highp float;
uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;
out vec4 fragColor;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.2113248654, 0.3660254038, -0.5773502692, 0.0243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = x0.x > x0.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m *= m; m *= m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.7928427 - 0.8537347 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec3 left = mix(uColorStops[0], uColorStops[1], smoothstep(0.0, 0.5, uv.x));
  vec3 ramp = mix(left, uColorStops[2], smoothstep(0.5, 1.0, uv.x));
  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  float intensity = 0.6 * (uv.y * 2.0 - height + 0.2);
  float alpha = smoothstep(0.2 - uBlend * 0.5, 0.2 + uBlend * 0.5, intensity);
  fragColor = vec4(intensity * ramp * alpha, alpha);
}
`

type AuroraProps = {
  colorStops?: string[]
  amplitude?: number
  blend?: number
  speed?: number
  className?: string
}

export function Aurora({
  colorStops = ['#8b80f9', '#a8dec9', '#f0d08d'],
  amplitude = 0.8,
  blend = 0.45,
  speed = 0.55,
  className = '',
}: AuroraProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const propsRef = useRef({ colorStops, amplitude, blend, speed })
  propsRef.current = { colorStops, amplitude, blend, speed }

  useEffect(() => {
    const container = containerRef.current
    if (!container || !('WebGL2RenderingContext' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: true })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    const geometry = new Triangle(gl)
    if (geometry.attributes.uv) delete geometry.attributes.uv
    const toRgb = (stops: string[]) => stops.map((stop) => { const color = new Color(stop); return [color.r, color.g, color.b] })
    const program = new Program(gl, {
      vertex: VERTEX,
      fragment: FRAGMENT,
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: amplitude },
        uColorStops: { value: toRgb(colorStops) },
        uResolution: { value: [container.offsetWidth, container.offsetHeight] },
        uBlend: { value: blend },
      },
    })
    const mesh = new Mesh(gl, { geometry, program })
    container.appendChild(gl.canvas)

    const resize = () => {
      const width = container.offsetWidth
      const height = container.offsetHeight
      renderer.setSize(width, height)
      program.uniforms.uResolution.value = [width, height]
    }
    let frameId = 0
    const frame = (time: number) => {
      const current = propsRef.current
      program.uniforms.uTime.value = time * 0.0001 * current.speed
      program.uniforms.uAmplitude.value = current.amplitude
      program.uniforms.uBlend.value = current.blend
      program.uniforms.uColorStops.value = toRgb(current.colorStops)
      renderer.render({ scene: mesh })
      frameId = requestAnimationFrame(frame)
    }

    resize()
    frameId = requestAnimationFrame(frame)
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
      if (gl.canvas.parentNode === container) container.removeChild(gl.canvas)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [])

  return <div ref={containerRef} className={`reactbits-aurora ${className}`} aria-hidden="true" />
}
