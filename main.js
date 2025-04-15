let scene, camera, renderer;
let stars = [];
let objetos3D = [];
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;
let clock;

let particleSystem;
let pixeladoMaterial;

// DOM
const loadingScreen = document.querySelector('.loading-screen');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const navLinksItems = document.querySelectorAll('.nav-links a');
const nav = document.querySelector('nav');

function init() {
    clock = new THREE.Clock();

    // Three.js base
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg'), antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    camera.position.set(0, 0, 100);

    // Luces
    scene.add(new THREE.AmbientLight(0x404040, 0.5));
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    pointLight.castShadow = true;
    scene.add(pointLight);
    const redLight = new THREE.PointLight(0xff0066, 2, 50);
    redLight.position.set(-15, 0, 10);
    scene.add(redLight);
    const blueLight = new THREE.PointLight(0x0066ff, 2, 50);
    blueLight.position.set(15, 0, 10);
    scene.add(blueLight);

    configurarFondo();
    crearObjetos3D();
    configurarEventos();
    crearEstrellasMejoradas();
    crearChips();
    
    // Inicia la animación
    animate();
    animateCameraIntro();

    // Oculta la pantalla de carga después de 1.5 segundos
    setTimeout(() => {
        if (loadingScreen) loadingScreen.classList.add('hidden');
        console.log("Pantalla de carga oculta");
    }, 1500);
}

function animateCameraIntro() {
    if (camera.position.z > 30) {
        camera.position.z -= (camera.position.z - 30) * 0.05;
        requestAnimationFrame(animateCameraIntro);
        renderer.render(scene, camera);
    }
}

function crearChips() {
    // Simplificamos para evitar cargar texturas que podrían fallar
    const chipGeometry = new THREE.PlaneGeometry(1, 1);
    const chipMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ff9d, 
        transparent: true, 
        depthWrite: false 
    });
    
    for (let i = 0; i < 15; i++) {
        const chip = new THREE.Mesh(chipGeometry, chipMaterial);
        chip.position.set(
            THREE.MathUtils.randFloatSpread(30), 
            THREE.MathUtils.randFloatSpread(30), 
            THREE.MathUtils.randFloatSpread(30)
        );
        chip.rotation.z = Math.random() * Math.PI;
        scene.add(chip);
        stars.push({ 
            mesh: chip, 
            speed: 0.01 + Math.random() * 0.03, 
            pulse: 0.001 + Math.random() * 0.003 
        });
    }
}

// Configurar fondo
function configurarFondo() {
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.Fog(0x000000, 50, 100);
}

// Crear objetos 3D simplificados
function crearObjetos3D() {
    // Cubo con efecto de videojuego
    const cuboGeometry = new THREE.BoxGeometry(3, 3, 3);
    const cuboMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ff9d,
        metalness: 0.3,
        roughness: 0.2,
        emissive: 0x003322,
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.9
    });
    
    const cubo = new THREE.Mesh(cuboGeometry, cuboMaterial);
    cubo.position.set(-15, 0, -10);
    cubo.castShadow = true;
    cubo.userData = { tipo: 'Game Asset: Cubo' };
    scene.add(cubo);
    objetos3D.push({
        mesh: cubo,
        rotationSpeed: {
            x: 0.005,
            y: 0.01,
            z: 0
        }
    });
    
    // Toroide (anillo)
    const torusGeometry = new THREE.TorusGeometry(3, 1, 16, 32);
    const torusMaterial = new THREE.MeshStandardMaterial({
        color: 0x00c3ff,
        wireframe: true,
        emissive: 0x001133,
        emissiveIntensity: 0.5
    });
    
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.set(15, 0, -15);
    torus.userData = { tipo: 'Game Asset: Anillo' };
    scene.add(torus);
    objetos3D.push({
        mesh: torus,
        rotationSpeed: {
            x: 0.01,
            y: 0.005,
            z: 0
        }
    });
}

// Crear estrellas mejoradas
function crearEstrellasMejoradas() {
    const starGeometry = new THREE.SphereGeometry(0.25, 24, 24);
    
    // Colores temáticos de videojuegos
    const colors = [
        0x6633ff, // Morado
        0x33ccff, // Azul claro
        0xff33cc, // Rosa
        0x33ffcc, // Turquesa
        0xffcc33  // Dorado
    ];
    
    for (let i = 0; i < 200; i++) {
        const x = THREE.MathUtils.randFloatSpread(100);
        const y = THREE.MathUtils.randFloatSpread(100);
        const z = THREE.MathUtils.randFloatSpread(100) - 50; // Todas las estrellas detrás de la cámara
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        const starMaterial = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: Math.random() * 0.5 + 0.5
        });
        
        const star = new THREE.Mesh(starGeometry, starMaterial);
        star.position.set(x, y, z);
        
        stars.push({
            mesh: star,
            pulse: Math.random() * 0.01,
            speed: Math.random() * 0.05
        });
        
        scene.add(star);
    }
}

// Configurar eventos
function configurarEventos() {
    // Evento de redimensión
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Evento de movimiento del mouse
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - window.innerWidth / 2) / 100;
        mouseY = (event.clientY - window.innerHeight / 2) / 100;
    });
    
    // Evento para dispositivos móviles
    document.addEventListener('touchmove', (event) => {
        if (event.touches.length > 0) {
            mouseX = (event.touches[0].clientX - window.innerWidth / 2) / 50;
            mouseY = (event.touches[0].clientY - window.innerHeight / 2) / 50;
        }
    });
    
    // Navegación móvil
    if (navToggle) {
        navToggle.addEventListener('click', toggleMenu);
    }
    
    // Cerrar menú al hacer clic en un enlace
    if (navLinksItems && navLinksItems.length > 0) {
        navLinksItems.forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks) navLinks.classList.remove('active');
                if (navToggle) navToggle.classList.remove('active');
            });
        });
    }
    
    // Cambiar estilo de navegación al hacer scroll
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        
        if (scrollPosition > 50) {
            if (nav) nav.classList.add('nav-scrolled');
        } else {
            if (nav) nav.classList.remove('nav-scrolled');
        }
    });
}

// Función para alternar menú móvil
function toggleMenu() {
    if (navLinks) navLinks.classList.toggle('active');
    if (navToggle) navToggle.classList.toggle('active');
}

// Función de animación
function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock ? clock.getElapsedTime() : 0;
    
    // Interpolación suave de la posición del mouse
    targetX = mouseX * 0.3;
    targetY = mouseY * 0.3;
    
    // Rotar la cámara para seguir el mouse
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (-targetY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    
    // Animar objetos 3D
    objetos3D.forEach(objeto => {
        objeto.mesh.rotation.x += objeto.rotationSpeed.x;
        objeto.mesh.rotation.y += objeto.rotationSpeed.y;
        objeto.mesh.rotation.z += objeto.rotationSpeed.z;
        
        // Añadir movimiento flotante
        if (elapsedTime > 0) {
            objeto.mesh.position.y += Math.sin(elapsedTime * 0.5) * 0.01;
        }
    });
    
    // Animar estrellas
    stars.forEach(star => {
        // Efecto de pulso
        const scale = 1 + Math.sin(Date.now() * star.pulse) * 0.3;
        star.mesh.scale.set(scale, scale, scale);
        
        // Movimiento
        star.mesh.position.z += star.speed;
        
        // Si la estrella está muy cerca, moverla de nuevo al fondo
        if (star.mesh.position.z > 20) {
            star.mesh.position.z = -50;
            star.mesh.position.x = THREE.MathUtils.randFloatSpread(100);
            star.mesh.position.y = THREE.MathUtils.randFloatSpread(100);
        }
    });
    
    // Animar luces para efectos dinámicos
    if (elapsedTime > 0) {
        const lights = scene.children.filter(child => child instanceof THREE.PointLight);
        lights.forEach(light => {
            // Ignorar luces que sean hijas de objetos
            if (light.parent === scene) {
                light.intensity = 1 + Math.sin(elapsedTime * 0.5) * 0.5;
            }
        });
    }
    
    renderer.render(scene, camera);
}

// Iniciar la aplicación cuando se carga la ventana
window.addEventListener('load', () => {
    console.log("Window loaded");
    init();
});