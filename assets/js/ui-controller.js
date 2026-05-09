const modal = document.getElementById('pdf-modal');
const pdfFrame = document.getElementById('pdf-frame');
const modalTitle = document.getElementById('modal-title');
const menuToggle = document.getElementById('menu-toggle');
const archScroll = document.getElementById('arch-scroll');
// Ensure metricSpans is queried only once
const metricSpans = document.querySelectorAll('.metric-span');
let archCards = document.querySelectorAll('.arch-card');

/**
 * Modal logic for document viewing
 */
function openModal(url, title) {
    pdfFrame.src = (url && url !== '#') ? url : "about:blank";
    modalTitle.textContent = title;
    modal.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('modal-open');
    setTimeout(() => { pdfFrame.src = ''; }, 300);
    document.body.style.overflow = 'auto';
}

/**
 * Infinite Scroll and Focus Logic
 */
function setupInfiniteScroll() {
    if (!archScroll || archCards.length === 0) return;
    
    const originalCount = archCards.length;

    // 1. Clone cards for infinite effect (clone the whole set to prepend and append)
    const firstSet = Array.from(archCards).map(card => card.cloneNode(true));
    const lastSet = Array.from(archCards).map(card => card.cloneNode(true));

    firstSet.forEach(clone => archScroll.appendChild(clone));
    lastSet.reverse().forEach(clone => archScroll.prepend(clone));

    archCards = document.querySelectorAll('.arch-card');

    // 2. Center Calculation Logic
    function updateFocusedCard() {
        const containerRect = archScroll.getBoundingClientRect();
        const containerCenter = containerRect.left + containerRect.width / 2;
        
        let closestCard = null;
        let minDistance = Infinity;

        archCards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const cardCenter = rect.left + rect.width / 2;
            const distance = Math.abs(containerCenter - cardCenter);

            if (distance < minDistance) {
                minDistance = distance;
                closestCard = card;
            }
        });

        archCards.forEach(card => {
            const isFocused = card === closestCard;
            if (isFocused !== card.classList.contains('focused')) {
                card.classList.toggle('focused', isFocused);
            }
        });

        if (closestCard) {
            const index = closestCard.dataset.index;
            metricSpans.forEach((span, i) => {
                span.classList.toggle('active', i == index);
            });
        }
    }

    // 3. Crisp Teleport Logic
    archScroll.addEventListener('scroll', () => {
        requestAnimationFrame(() => {
            updateFocusedCard();
            
            const setWidth = archScroll.scrollWidth / 3;
            const scrollLeft = archScroll.scrollLeft;

            // Temporarily disable snap to prevent browser fighting the teleport
            if (scrollLeft < setWidth * 0.5) {
                archScroll.style.scrollSnapType = 'none';
                archScroll.scrollLeft += setWidth;
                requestAnimationFrame(() => archScroll.style.scrollSnapType = '');
            } else if (scrollLeft > setWidth * 2.5) {
                archScroll.style.scrollSnapType = 'none';
                archScroll.scrollLeft -= setWidth;
                requestAnimationFrame(() => archScroll.style.scrollSnapType = '');
            }
        });
    });

    window.addEventListener('load', () => {
        const targetCard = archCards[originalCount]; // First card of middle set
        archScroll.scrollLeft = targetCard.offsetLeft - (archScroll.clientWidth / 2) + (targetCard.offsetWidth / 2);
        updateFocusedCard();
    });
}

setupInfiniteScroll();

metricSpans.forEach(span => {
    span.addEventListener('click', () => {
        const index = parseInt(span.dataset.index);
        // Find the "original" card in the middle section to scroll to
        const targetCard = Array.from(archCards).find((card, i) => 
            card.dataset.index == index && i >= metricSpans.length && i < metricSpans.length * 2
        );

        if (targetCard) {
            const containerWidth = archScroll.offsetWidth;
            const cardWidth = targetCard.offsetWidth;
            const cardOffset = targetCard.offsetLeft;
            
            // Calculate position to center the card exactly
            const scrollPos = cardOffset - (containerWidth / 2) + (cardWidth / 2);
            
            archScroll.scrollTo({
                left: scrollPos,
                behavior: 'smooth'
            });
        }
    });
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

menuToggle?.addEventListener('click', () => {
    console.log('Mobile menu interaction triggered');
});