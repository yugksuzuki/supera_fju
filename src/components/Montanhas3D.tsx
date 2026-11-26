import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap, semMovimento } from '@/lib/movimento';

/*
  Cordilheira facetada do selo SUPERA, em 3D, atrás do selo no login.
  Carregada sob demanda (React.lazy), então o three.js não pesa no resto do app.
  - pausa quando a aba some ou a faixa sai da tela
  - "reduzir movimento": desenha um quadro parado e não anima
*/

const COR_NEVOA = new THREE.Color('#b51129');

/** Ruído determinístico pela posição: vértices repetidos na emenda do cone se movem juntos. */
const ruido = (x: number, y: number, z: number, semente: number) => {
  const v = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + semente) * 43758.5453;
  return v - Math.floor(v) - 0.5;
};

/** Cone facetado com as arestas levemente tortas, para não parecer geometria de livro. */
function pico(raio: number, altura: number, lados: number, cor: string, semente: number) {
  const geo = new THREE.ConeGeometry(raio, altura, lados, 3, true);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = Math.round(pos.getX(i) * 1000) / 1000;
    const y = Math.round(pos.getY(i) * 1000) / 1000;
    const z = Math.round(pos.getZ(i) * 1000) / 1000;
    if (y >= altura / 2 - 0.001) continue; // a ponta fica no lugar
    const solto = 0.22 * raio * (0.4 + (altura / 2 - y) / altura);
    pos.setX(i, x + ruido(x, y, z, semente) * solto);
    pos.setZ(i, z + ruido(z, x, y, semente + 1) * solto);
    pos.setY(i, y + ruido(y, z, x, semente + 2) * 0.1 * altura);
  }
  geo.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({ color: cor, flatShading: true, roughness: 0.85, metalness: 0 });
  const malha = new THREE.Mesh(geo, mat);
  malha.position.y = altura / 2;
  const grupo = new THREE.Group();
  grupo.add(malha);
  return grupo;
}

function bandeira() {
  const grupo = new THREE.Group();
  const mastro = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, 0.9, 6),
    new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.6 }),
  );
  mastro.position.y = 0.45;
  grupo.add(mastro);
  // pano com vários vértices para poder ondular
  const pano = new THREE.PlaneGeometry(0.55, 0.32, 10, 4);
  pano.translate(0.275, 0, 0);
  const tecido = new THREE.Mesh(
    pano,
    new THREE.MeshStandardMaterial({ color: '#ffffff', side: THREE.DoubleSide, flatShading: true, roughness: 0.7 }),
  );
  tecido.position.set(0.02, 0.74, 0);
  grupo.add(tecido);
  return { grupo, pano };
}

export default function Montanhas3D({ className }: { className?: string }) {
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = caixa.current;
    if (!el) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch {
      return; // sem WebGL: fica só o degradê vermelho
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-hidden', 'true');

    const cena = new THREE.Scene();
    cena.fog = new THREE.Fog(COR_NEVOA, 9, 22);
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
    camera.position.set(0, 2.1, 11);

    cena.add(new THREE.HemisphereLight('#ffe9ec', '#6d0716', 1.25));
    const sol = new THREE.DirectionalLight('#ffffff', 2.2);
    sol.position.set(-5, 7, 6);
    cena.add(sol);

    const serra = new THREE.Group();
    serra.position.y = -0.9; // a base fica escondida atrás da borda serrilhada
    cena.add(serra);
    // [x, z, raio, altura, lados, cor]
    const picos: [number, number, number, number, number, string][] = [
      [0, 0, 1.9, 3.3, 6, '#fff5f6'], // cume
      [-2.3, -0.6, 1.5, 2.5, 5, '#ffdce1'],
      [2.4, -0.4, 1.6, 2.7, 5, '#ffd3d9'],
      [-4.6, -2.2, 1.9, 2.6, 6, '#ffb3bd'],
      [4.8, -2.4, 2.0, 2.9, 6, '#ffaab5'],
      [-7.4, -4.6, 2.4, 3.0, 5, '#ff8b9b'],
      [7.2, -4.2, 2.3, 2.6, 5, '#ff8b9b'],
      [-1.2, -5.5, 2.6, 3.4, 6, '#ff95a4'],
      [3.6, -6.5, 2.8, 3.1, 6, '#ff95a4'],
      // laterais largas, para a serra cobrir telas largas
      [-10.2, -3.6, 2.6, 2.4, 5, '#ffa3b0'],
      [10.4, -3.2, 2.7, 2.6, 5, '#ffa3b0'],
      [-13.6, -6.8, 3.2, 3.0, 6, '#ff8b9b'],
      [13.8, -7.2, 3.3, 2.8, 6, '#ff8b9b'],
      [-6.0, -9.0, 3.4, 3.6, 6, '#ff8697'],
      [7.8, -9.5, 3.6, 3.4, 6, '#ff8697'],
    ];
    const blocos = picos.map(([x, z, r, h, l, cor], i) => {
      const p = pico(r, h, l, cor, 17 + i * 31);
      p.position.set(x, 0, z);
      serra.add(p);
      return p;
    });
    const { grupo: flag, pano } = bandeira();
    flag.position.set(0, 3.25, 0);
    blocos[0].add(flag);
    const panoBase = Float32Array.from(pano.attributes.position.array as Float32Array);

    const tamanho = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      camera.aspect = w / h;
      // em tela estreita, afasta a câmera para caber a serra inteira
      camera.position.z = w / h < 1 ? 15.5 : 11.5;
      camera.lookAt(0, w / h < 1 ? 2.6 : 2.2, 0);
      camera.updateProjectionMatrix();
    };
    tamanho();
    const ro = new ResizeObserver(tamanho);
    ro.observe(el);

    const desenhar = () => renderer.render(cena, camera);

    if (semMovimento()) {
      desenhar();
      return () => {
        ro.disconnect();
        renderer.dispose();
        el.innerHTML = '';
      };
    }

    // Entrada: a serra sobe do chão, picos do fundo primeiro.
    const subida = gsap.from(
      blocos.map((b) => b.position),
      { y: -4.2, duration: 1.6, ease: 'expo.out', stagger: { each: 0.06, from: 'end' } },
    );

    // Paralaxe leve com mouse ou dedo.
    const alvo = { x: 0, y: 0 };
    const mover = (e: PointerEvent) => {
      alvo.x = (e.clientX / window.innerWidth - 0.5) * 2;
      alvo.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', mover, { passive: true });

    let visivel = true;
    const io = new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
    });
    io.observe(el);

    const relogio = new THREE.Clock();
    let quadro = 0;
    const loop = () => {
      quadro = requestAnimationFrame(loop);
      if (!visivel || document.hidden) return;
      const t = relogio.getElapsedTime();
      serra.rotation.y += (alvo.x * 0.22 + Math.sin(t * 0.18) * 0.06 - serra.rotation.y) * 0.04;
      serra.rotation.x += (alvo.y * 0.05 - serra.rotation.x) * 0.04;
      // pano ondulando: mais solto na ponta do que junto ao mastro
      const p = pano.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = panoBase[i * 3];
        p.setZ(i, Math.sin(x * 9 - t * 4.2) * 0.05 * (x / 0.55));
      }
      p.needsUpdate = true;
      desenhar();
    };
    loop();

    return () => {
      cancelAnimationFrame(quadro);
      subida.kill();
      window.removeEventListener('pointermove', mover);
      io.disconnect();
      ro.disconnect();
      cena.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (o.material as THREE.Material).dispose();
        }
      });
      renderer.dispose();
      el.innerHTML = '';
    };
  }, []);

  return <div ref={caixa} className={className} />;
}
