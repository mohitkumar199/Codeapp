// DOM Elements
const htmlCode = document.getElementById('htmlCode');
const cssCode = document.getElementById('cssCode');
const jsCode = document.getElementById('jsCode');
const previewFrame = document.getElementById('previewFrame');
const tabBtns = document.querySelectorAll('.tab-btn');
const htmlTab = document.querySelector('.html-tab');
const cssTab = document.querySelector('.css-tab');
const jsTab = document.querySelector('.js-tab');
const htmlEditor = document.querySelector('.html-editor');
const cssEditor = document.querySelector('.css-editor');
const jsEditor = document.querySelector('.js-editor');
const saveBtn = document.getElementById('saveBtn');
const exportBtn = document.getElementById('exportBtn');
const projectList = document.getElementById('projectList');
const installBtn = document.getElementById('installBtn');

// Auto-generate HTML5 boilerplate
htmlCode.addEventListener('input', (e) => {
    if (e.target.value.trim() === '<!DOCTYPE html>') {
        e.target.value = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        /* CSS goes here */
    </style>
</head>
<body>
    <!-- HTML goes here -->
    <script>
        // JavaScript goes here
    </script>
</body>
</html>`;
    }
    updatePreview();
});

// Tab switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('text-blue-600', 'border-blue-600'));
        btn.classList.add('text-blue-600', 'border-blue-600');
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(btn.dataset.tab).classList.add('active');
        
        if (btn.dataset.tab === 'preview') {
            updatePreview();
        }
    });
});

// Editor tab switching
htmlTab.addEventListener('click', () => {
    [htmlTab, cssTab, jsTab].forEach(tab => tab.classList.remove('bg-blue-600', 'text-white'));
    htmlTab.classList.add('bg-blue-600', 'text-white');
    [htmlEditor, cssEditor, jsEditor].forEach(editor => editor.classList.add('hidden'));
    htmlEditor.classList.remove('hidden');
});

cssTab.addEventListener('click', () => {
    [htmlTab, cssTab, jsTab].forEach(tab => tab.classList.remove('bg-blue-600', 'text-white'));
    cssTab.classList.add('bg-blue-600', 'text-white');
    [htmlEditor, cssEditor, jsEditor].forEach(editor => editor.classList.add('hidden'));
    cssEditor.classList.remove('hidden');
});

jsTab.addEventListener('click', () => {
    [htmlTab, cssTab, jsTab].forEach(tab => tab.classList.remove('bg-blue-600', 'text-white'));
    jsTab.classList.add('bg-blue-600', 'text-white');
    [htmlEditor, cssEditor, jsEditor].forEach(editor => editor.classList.add('hidden'));
    jsEditor.classList.remove('hidden');
});

// Update preview
function updatePreview() {
    const html = htmlCode.value;
    const css = `<style>${cssCode.value}</style>`;
    const js = `<script>${jsCode.value}<\/script>`;
    
    const doc = previewFrame.contentDocument || previewFrame.contentWindow.document;
    doc.open();
    doc.write(html.replace('</head>', css + '</head>').replace('</body>', js + '</body>'));
    doc.close();
}

// Debounce function for live preview
let debounceTimer;
[htmlCode, cssCode, jsCode].forEach(editor => {
    editor.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(updatePreview, 500);
    });
});

// Save project to local storage
saveBtn.addEventListener('click', () => {
    const projectName = prompt('Enter project name:');
    if (projectName) {
        const projects = JSON.parse(localStorage.getItem('codepad-projects') || '[]');
        const project = {
            id: Date.now(),
            name: projectName,
            html: htmlCode.value,
            css: cssCode.value,
            js: jsCode.value,
            date: new Date().toISOString()
        };
        projects.push(project);
        localStorage.setItem('codepad-projects', JSON.stringify(projects));
        loadProjects();
        alert('Project saved successfully!');
    }
});

// Load projects from local storage
function loadProjects() {
    const projects = JSON.parse(localStorage.getItem('codepad-projects') || '[]');
    projectList.innerHTML = '';
    
    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'bg-white p-4 rounded-lg shadow-md border';
        projectCard.innerHTML = `
            <h3 class="font-medium text-lg mb-2">${project.name}</h3>
            <p class="text-gray-500 text-sm mb-3">${new Date(project.date).toLocaleString()}</p>
            <div class="flex space-x-2">
                <button class="load-btn px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm" data-id="${project.id}">
                    <i class="fas fa-upload mr-1"></i>Load
                </button>
                <button class="delete-btn px-2 py-1 bg-red-100 text-red-600 rounded text-sm" data-id="${project.id}">
                    <i class="fas fa-trash mr-1"></i>Delete
                </button>
            </div>
        `;
        projectList.appendChild(projectCard);
    });
    
    // Add event listeners to load and delete buttons
    document.querySelectorAll('.load-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const projectId = parseInt(btn.dataset.id);
            const projects = JSON.parse(localStorage.getItem('codepad-projects') || '[]');
            const project = projects.find(p => p.id === projectId);
            if (project) {
                htmlCode.value = project.html;
                cssCode.value = project.css;
                jsCode.value = project.js;
                updatePreview();
                document.querySelector('.tab-btn[data-tab="editor"]').click();
            }
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this project?')) {
                const projectId = parseInt(btn.dataset.id);
                let projects = JSON.parse(localStorage.getItem('codepad-projects') || '[]');
                projects = projects.filter(p => p.id !== projectId);
                localStorage.setItem('codepad-projects', JSON.stringify(projects));
                loadProjects();
            }
        });
    });
}

// Export project as ZIP
exportBtn.addEventListener('click', () => {
    if (typeof JSZip === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        script.onload = exportAsZip;
        document.head.appendChild(script);
    } else {
        exportAsZip();
    }
});

function exportAsZip() {
    const zip = new JSZip();
    zip.file("index.html", htmlCode.value);
    zip.file("style.css", cssCode.value);
    zip.file("script.js", jsCode.value);
    
    zip.generateAsync({type:"blob"})
        .then(function(content) {
            const a = document.createElement('a');
            const url = URL.createObjectURL(content);
            a.href = url;
            a.download = 'codepad-project.zip';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 0);
        });
}

// PWA Installation
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'block';
});

installBtn.addEventListener('click', () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted install prompt');
                installBtn.style.display = 'none';
            }
            deferredPrompt = null;
        });
    }
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    htmlTab.click();
    document.querySelector('.tab-btn[data-tab="editor"]').click();
});