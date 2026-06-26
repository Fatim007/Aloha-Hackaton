// ===== GESTION PANIER AVEC LOCALSTORAGE =====

// Récupérer panier du localStorage ou créer vide
function getPanier() {
  return JSON.parse(localStorage.getItem('panier')) || [];
}

// Sauvegarder panier dans localStorage
function savePanier(panier) {
  localStorage.setItem('panier', JSON.stringify(panier));
  updatePanierCount();
}

// Mettre à jour le compteur 🛒 en haut
function updatePanierCount() {
  const panier = getPanier();
  const totalQte = panier.reduce((sum, item) => sum + item.qte, 0);
  const countSpan = document.getElementById('panier-count');
  if (countSpan) {
    countSpan.textContent = totalQte;
  }
}

// Ajouter un produit au panier
function ajouterAuPanier(id, nom, prix, img) {
  const panier = getPanier();
  const itemExistant = panier.find(item => item.id === id);
  
  if (itemExistant) {
    itemExistant.qte += 1;
  } else {
    panier.push({ id, nom, prix, img, qte: 1 });
  }
  
  savePanier(panier);
  
  // Notification rapide
  alert(nom + ' ajouté au panier !');
}

// Acheter directement = ajouter + rediriger vers panier
function acheterMaintenant(id, nom, prix, img) {
  ajouterAuPanier(id, nom, prix, img);
  window.location.href = 'panier.html';
}

// ===== BRANCHER LES BOUTONS SUR CHAQUE PAGE =====

document.addEventListener('DOMContentLoaded', function() {
  
  // 1. Mettre à jour le compteur au chargement
  updatePanierCount();
  
  // 2. Boutons "Ajouter au panier" sur page saveurs
  document.querySelectorAll('.btn-outline').forEach(btn => {
    if (btn.textContent.includes('Ajouter au panier')) {
      btn.addEventListener('click', function() {
        const card = this.closest('.card');
        const id = card.querySelector('h3').textContent.toLowerCase().replace(/\s+/g, '-');
        const nom = card.querySelector('h3').textContent;
        const prix = parseInt(card.querySelector('.prix').textContent.replace(/\D/g, ''));
        const img = card.querySelector('img').src;
        
        ajouterAuPanier(id, nom, prix, img);
      });
    }
  });
  
  // 3. Boutons "Acheter" sur page saveurs
  document.querySelectorAll('.btn').forEach(btn => {
    if (btn.textContent.trim() === 'Acheter' && !btn.classList.contains('btn-paiement')) {
      btn.addEventListener('click', function() {
        const card = this.closest('.card');
        const id = card.querySelector('h3').textContent.toLowerCase().replace(/\s+/g, '-');
        const nom = card.querySelector('h3').textContent;
        const prix = parseInt(card.querySelector('.prix').textContent.replace(/\D/g, ''));
        const img = card.querySelector('img').src;
        
        acheterMaintenant(id, nom, prix, img);
      });
    }
  });
  
  // 4. Si on est sur panier.html → afficher le panier
  if (window.location.pathname.includes('panier.html')) {
    afficherPanier();
  }
});

// ===== FONCTIONS POUR PAGE PANIER.HTML =====

function afficherPanier() {
  const panier = getPanier();
  const liste = document.querySelector('.panier-liste');
  const panierVide = document.querySelector('.panier-vide');
  
  if (panier.length === 0) {
    panierVide.style.display = 'block';
    return;
  }
  
  panierVide.style.display = 'none';
  
  // Supprimer les items d'exemple
  document.querySelectorAll('.panier-item').forEach(item => item.remove());
  
  // Afficher chaque produit du panier
  panier.forEach(item => {
    const div = document.createElement('div');
    div.className = 'panier-item';
    div.dataset.id = item.id;
    div.dataset.prix = item.prix;
    div.innerHTML = `
      <img src="${item.img}" alt="${item.nom}">
      <div class="item-info">
        <h3>${item.nom}</h3>
        <p class="item-desc">Pot 250g - 100% naturel</p>
        <span class="item-prix">${item.prix.toLocaleString()} FCFA</span>
      </div>
      <div class="item-qte">
        <button class="qte-btn minus">-</button>
        <span class="qte">${item.qte}</span>
        <button class="qte-btn plus">+</button>
      </div>
      <button class="supprimer">×</button>
    `;
    liste.insertBefore(div, panierVide);
  });
  
  brancherEventsPanier();
  calculerTotal();
}

function brancherEventsPanier() {
  // Boutons + et -
  document.querySelectorAll('.qte-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const item = this.closest('.panier-item');
      const id = item.dataset.id;
      const qteSpan = item.querySelector('.qte');
      let qte = parseInt(qteSpan.textContent);
      
      if (this.classList.contains('plus')) {
        qte++;
      } else if (qte > 1) {
        qte--;
      } else {
        supprimerItem(id);
        return;
      }
      
      qteSpan.textContent = qte;
      updateQtePanier(id, qte);
    });
  });
  
  // Bouton supprimer
  document.querySelectorAll('.supprimer').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.closest('.panier-item').dataset.id;
      supprimerItem(id);
    });
  });
}

function updateQtePanier(id, qte) {
  const panier = getPanier();
  const item = panier.find(p => p.id === id);
  if (item) {
    item.qte = qte;
    savePanier(panier);
    calculerTotal();
  }
}

function supprimerItem(id) {
  let panier = getPanier();
  panier = panier.filter(p => p.id !== id);
  savePanier(panier);
  document.querySelector(`[data-id="${id}"]`).remove();
  calculerTotal();
  if (panier.length === 0) {
    document.querySelector('.panier-vide').style.display = 'block';
  }
}

function calculerTotal() {
  const fraisLivraison = 1000;
  let sousTotal = 0;
  
  getPanier().forEach(item => {
    sousTotal += item.prix * item.qte;
  });
  
  const sousTotalEl = document.getElementById('sous-total');
  const totalEl = document.getElementById('total');
  
  if (sousTotalEl) sousTotalEl.textContent = sousTotal.toLocaleString() + ' FCFA';
  if (totalEl) totalEl.textContent = (sousTotal + fraisLivraison).toLocaleString() + ' FCFA';
}

// ===== SIMULATION PAIEMENT =====
document.addEventListener('DOMContentLoaded', function() {
  const btnPayer = document.getElementById('btn-payer');
  const modal = document.getElementById('modal-paiement');
  
  if (btnPayer) {
    btnPayer.addEventListener('click', function() {
      if (getPanier().length === 0) {
        alert('Votre panier est vide');
        return;
      }
      
      const num = Math.floor(1000 + Math.random() * 9000);
      document.getElementById('num-commande').textContent = num;
      modal.classList.add('show');
      
      // Vider panier après paiement
      setTimeout(() => {
        localStorage.removeItem('panier');
        updatePanierCount();
        window.location.href = 'index.html';
      }, 4000);
    });
  }
  
  const btnFermer = document.getElementById('btn-fermer');
  const closeModal = document.getElementById('close-modal');
  
  if (btnFermer) btnFermer.addEventListener('click', () => modal.classList.remove('show'));
  if (closeModal) closeModal.addEventListener('click', () => modal.classList.remove('show'));
});