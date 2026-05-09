<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flora 40+ | Equilíbrio Interior</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#A3D9D3',
                        secondary: '#E8C7C8',
                    }
                }
            }
        }
    </script>
    <style>
        body { font-family: 'Inter', sans-serif; background: radial-gradient(circle at top right, #1E4A4A, #0F2A2A); color: white; }
        h1, h2, h3 { font-family: 'Playfair Display', serif; }
        .glass { background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.1); }
        .nav-active { color: #A3D9D3; }
        .hidden-section { display: none; }
        .active-section { display: block; }
    </style>
</head>
<body class="min-h-screen pb-24">

    <!-- Header -->
    <header class="p-6 flex justify-between items-center">
        <div>
            <h1 class="text-2xl font-bold">Flora 40+</h1>
            <p class="text-white/60 text-sm">Olá, Claudia</p>
        </div>
        <div class="w-10 h-10 rounded-full glass border border-white/20"></div>
    </header>

    <!-- Main Content -->
    <main id="app-content" class="px-6">
        <!-- Dashboard -->
        <section id="dashboard" class="active-section space-y-6">
            <div class="glass p-6 rounded-3xl text-center">
                <p class="text-sm uppercase tracking-widest text-white/50 mb-2">Gut Health Score</p>
                <div class="text-5xl font-bold text-primary">78</div>
            </div>
            <div class="glass p-6 rounded-3xl">
                <h2 class="text-xl mb-4">Dica do Dia</h2>
                <p class="text-sm leading-relaxed text-white/80 italic">"Inclua fibras fermentáveis como o feijão cozido. Sua microbiota agradece e a saciedade aumenta."</p>
            </div>
        </section>

        <!-- Placeholder Sections -->
        <section id="rastreador" class="hidden-section space-y-6">
            <h2 class="text-2xl">Rastreador</h2>
            <div class="glass p-6 rounded-3xl"><canvas id="healthChart"></canvas></div>
        </section>

        <section id="plano" class="hidden-section space-y-6">
            <h2 class="text-2xl">Plano Alimentar</h2>
            <div class="glass p-6 rounded-3xl text-sm">Estrutura de refeições aqui...</div>
        </section>

        <section id="receitas" class="hidden-section space-y-6">
            <h2 class="text-2xl">Receitas</h2>
            <div class="grid grid-cols-2 gap-4">
                <div class="glass p-4 rounded-2xl">Smoothie Detox</div>
                <div class="glass p-4 rounded-2xl">Bowl de Quinoa</div>
            </div>
        </section>

        <section id="comunidade" class="hidden-section space-y-6">
            <h2 class="text-2xl">Comunidade</h2>
            <div class="glass p-6 rounded-3xl">Postagens das integrantes...</div>
        </section>
    </main>

    <!-- Bottom Nav -->
    <nav class="fixed bottom-4 left-4 right-4 glass rounded-full px-6 py-4 flex justify-between items-center z-50">
        <button onclick="showSection('dashboard')" class="nav-btn" data-target="dashboard">Home</button>
        <button onclick="showSection('rastreador')" class="nav-btn" data-target="rastreador">Stats</button>
        <button onclick="showSection('plano')" class="nav-btn" data-target="plano">Plano</button>
        <button onclick="showSection('receitas')" class="nav-btn" data-target="receitas">Bowl</button>
        <button onclick="showSection('comunidade')" class="nav-btn" data-target="comunidade">Nós</button>
    </nav>

    <script>
        function showSection(id) {
            document.querySelectorAll('section').forEach(s => s.classList.add('hidden-section'));
            document.getElementById(id).classList.remove('hidden-section');
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('nav-active'));
            event.target.classList.add('nav-active');
        }

        const ctx = document.getElementById('healthChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
                datasets: [{ data: [65, 70, 75, 72, 80], borderColor: '#A3D9D3', tension: 0.4 }]
            },
            options: { plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { ticks: { color: 'white' } } } }
        });
    </script>
</body>
</html>
