/**
 * DrosoLab — Main Application
 * Entry point and event handlers
 */

// Initialize components
const f1Grid = new PunnettGrid('f1PunnettGrid');
const f2Grid = new PunnettGrid('f2PunnettGrid');
const f1Stats = new StatsPanel('f1Stats');
const f2Stats = new StatsPanel('f2Stats');

// Current cross data
let currentCross = null;
let currentF1 = null;

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    renderTraitLibrary();
    updateParentDisplay('male');
    updateParentDisplay('female');
});

function initializeEventListeners() {
    // Parent selectors
    ['male', 'female'].forEach(sex => {
        ['Body', 'Eye', 'Wing'].forEach(trait => {
            const el = document.getElementById(`${sex}${trait}`);
            if (el) {
                el.addEventListener('change', () => updateParentDisplay(sex));
            }
        });
    });
    
    // Tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
}

function updateParentDisplay(sex) {
    const body = document.getElementById(`${sex}Body`).value;
    const eye = document.getElementById(`${sex}Eye`).value;
    const wing = document.getElementById(`${sex}Wing`).value;
    
    // Update genotype display
    const genotypeEl = document.getElementById(`${sex}Genotype`);
    genotypeEl.innerHTML = formatGenotype(body, eye, wing);
    
    // Update visual
    const visual = document.querySelector(`#${sex}Phenotype .fly-avatar`);
    const info = document.querySelector(`#${sex}Phenotype .phenotype-info`);
    
    // Set data attributes for CSS styling
    visual.setAttribute('data-body', body.includes('E') ? 'gray' : 'ebony');
    visual.setAttribute('data-eye', eye.includes('R') ? 'red' : 'white');
    visual.setAttribute('data-wing', wing.includes('V') ? 'long' : 'vestigial');
    
    // Update wing class
    const wings = visual.querySelector('.fly-wings');
    wings.classList.toggle('vestigial', wing === 'vv');
    
    // Update text
    const pheno = calculatePhenotype(body, eye, wing);
    info.querySelector('strong').textContent = pheno.name;
    info.querySelector('span').textContent = pheno.description;
}

function formatGenotype(body, eye, wing) {
    // Format with superscripts for sex chromosomes
    let eyeFormatted = eye;
    if (eye.includes('X')) {
        eyeFormatted = eye.replace(/X([Rr])/g, 'X<sup>$1</sup>');
        if (eye.includes('Y')) eyeFormatted += 'Y';
    }
    return `${body} ${eyeFormatted} ${wing}`;
}

function calculatePhenotype(body, eye, wing) {
    const parts = [];
    let mutantCount = 0;
    
    if (body === 'ee') {
        parts.push('Ebony body');
        mutantCount++;
    } else {
        parts.push('Gray body');
    }
    
    if ((eye === 'XrY' || eye === 'XrXr') && !eye.includes
