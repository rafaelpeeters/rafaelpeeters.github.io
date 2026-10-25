// Copie de l'email
const copyBtn = document.getElementById('copy-btn');
const toast = document.getElementById('toast');
const email = document.getElementById('contact-email').textContent;

copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(email).then(() => {
    toast.classList.remove('hidden');
    toast.classList.add('flex');
    copyBtn.innerHTML = `<span>Copié ✓</span> <span class="text-blue-400">✓</span>`;

    setTimeout(() => {
      toast.classList.add('hidden');
      toast.classList.remove('flex');
      copyBtn.innerHTML = `<span>Copier l'adresse</span> <span class="text-blue-400">📋</span>`;
    }, 2500);
  });
});

// Dépliage / repliage des projets supplémentaires
let isExpanded = false;

function toggleProjects() {
  const extras = document.querySelectorAll('.extra-project');
  const btnText = document.getElementById('toggle-projects-text');
  const btnIcon = document.getElementById('toggle-projects-icon');

  isExpanded = !isExpanded;

  extras.forEach(el => {
    if (isExpanded) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });

  btnText.textContent = isExpanded ? 'Afficher moins' : 'Afficher plus de projets';
  btnIcon.textContent = isExpanded ? '↑' : '↓';
}