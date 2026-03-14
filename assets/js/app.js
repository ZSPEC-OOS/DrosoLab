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
    
    if ((eye === 'XrY' || eye === 'XrXr') && !eye.includes('R')) {
        parts.push('White eyes');
        mutantCount++;
    } else {
        parts.push('Red eyes');
    }
    
    if (wing === 'vv') {
        parts.push('Vestigial wings');
        mutantCount++;
    } else {
        parts.push('Long wings');
    }
    
    let name = 'Wild Type';
    if (mutantCount === 3) name = 'Triple Mutant';
    else if (mutantCount === 2) name = 'Double Mutant';
    else if (mutantCount === 1) name = 'Single Mutant';
    
    return {
        name,
        description: parts.join(', ')
    };
}

function performCross() {
    // Get genotypes
    const maleBody = document.getElementById('maleBody').value;
    const maleEye = document.getElementById('maleEye').value;
    const maleWing = document.getElementById('maleWing').value;
    
    const femaleBody = document.getElementById('femaleBody').value;
    const femaleEye = document.getElementById('femaleEye').value;
    const femaleWing = document.getElementById('femaleWing').value;
    
    const maleGeno = `${maleBody} ${maleEye} ${maleWing}`;
    const femaleGeno = `${femaleBody} ${femaleEye} ${femaleWing}`;
    
    // Perform F1 cross
    currentCross = Calc.cross(maleGeno, femaleGeno);
    currentF1 = Object.keys(currentCross.offspring)[0]; // Store for F2
    
    // Display results
    displayResults(maleGeno, femaleGeno);
    
    // Show panel
    document.getElementById('resultsPanel').style.display = 'block';
    document.getElementById('resultsPanel').scrollIntoView({ behavior: 'smooth' });
}

function displayResults(maleGeno, femaleGeno) {
    // Parent summary
    const parentsDisplay = document.getElementById('parentsDisplay');
    const mPheno = calculatePhenotype(
        document.getElementById('maleBody').value,
        document.getElementById('maleEye').value,
        document.getElementById('maleWing').value
    );
    const fPheno = calculatePhenotype(
        document.getElementById('femaleBody').value,
        document.getElementById('femaleEye').value,
        document.getElementById('femaleWing').value
    );
    
    parentsDisplay.innerHTML = `
        <div class="parent-box">
            <div class="sex">♂</div>
            <div class="genotype">${formatGenotypeForDisplay(maleGeno)}</div>
            <div class="phenotype">${mPheno.name}</div>
        </div>
        <div class="cross-symbol">×</div>
        <div class="parent-box">
            <div class="sex">♀</div>
            <div class="genotype">${formatGenotypeForDisplay(femaleGeno)}</div>
            <div class="phenotype">${fPheno.name}</div>
        </div>
    `;
    
    // F1 Generation
    f1Grid.render(currentCross, { showProbabilities: true });
    f1Stats.render(currentCross);
    
    // F2 Generation (F1 self-cross)
    const f2Cross = Calc.calculateF2(currentF1);
    f2Grid.render(f2Cross, { showProbabilities: true, size: 'large' });
    f2Stats.render(f2Cross);
    
    // Calculate and display ratio
    displayRatio(f2Cross);
}

function formatGenotypeForDisplay(geno) {
    return geno.replace(/X([Rr])/g, 'X<sup>$1</sup>');
}

function displayRatio(f2Cross) {
    const groups = {};
    for (const key in f2Cross.offspring) {
        const cat = f2Cross.offspring[key].phenotype.category;
        groups[cat] = (groups[cat] || 0) + f2Cross.offspring[key].count;
    }
    
    const sorted = Object.entries(groups).sort((a, b) => b[1] - a[1]);
    const ratio = sorted.map(([_, count]) => count).join(':');
    
    const ratioDisplay = document.getElementById('f2Ratio');
    const ratioNames = {
        '9:3:3:1': '9:3:3:1 (Classic Dihybrid)',
        '3:1': '3:1 (Monohybrid)',
        '1:1': '1:1 (Test Cross)',
        '1:0': '1:0 (Uniform)'
    };
    
    ratioDisplay.textContent = ratioNames[ratio] || ratio;
}

function switchTab(tabName) {
    // Update buttons
    document.querySelectorAll('.tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tabName);
    });
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(c => {
        c.classList.toggle('active', c.id === `${tabName}Content`);
    });
}

function renderTraitLibrary() {
    const container = document.getElementById('traitLibrary');
    
    const traits = [
        {
            name: 'Body Color',
            gene: 'E/e',
            type: 'autosomal',
            chrom: '3',
            dom: 'Gray (E)',
            rec: 'Ebony (e)',
            desc: 'Body pigmentation. Gray is wild-type, ebony is a dark recessive mutation.'
        },
        {
            name: 'Eye Color',
            gene: 'R/r',
            type: 'sex-linked',
            chrom: 'X',
            dom: 'Red (X^R)',
            rec: 'White (X^r)',
            desc: 'X-linked inheritance. White eyes discovered by Morgan (1910). Males are hemizygous.'
        },
        {
            name: 'Wing Type',
            gene: 'V/v',
            type: 'autosomal',
            chrom: '2',
            dom: 'Long (V)',
            rec: 'Vestigial (v)',
            desc: 'Wing development. Vestigial wings are shortened and cannot support flight.'
        }
    ];
    
    container.innerHTML = traits.map(t => `
        <div class="trait-card">
            <div class="trait-header">
                <span class="trait-name">${t.name}</span>
                <span class="trait-type ${t.type}">${t.type}</span>
            </div>
            <div class="trait-description">${t.desc}</div>
            <div class="trait-alleles">
                <div class="allele">
                    <span class="allele-symbol dominant">${t.dom}</span>
                    <span>Dominant</span>
                </div>
                <div class="allele">
                    <span class="allele-symbol recessive">${t.rec}</span>
                    <span>Recessive</span>
                </div>
            </div>
            <span class="chromosome-location">Chromosome ${t.chrom}</span>
        </div>
    `).join('');
}

function randomizeParents() {
    const randomGeno = () => {
        const options = ['EE', 'Ee', 'ee'];
        return options[Math.floor(Math.random() * options.length)];
    };
    
    const randomEye = (sex) => {
        if (sex === 'male') {
            return Math.random() > 0.5 ? 'XRY' : 'XrY';
        } else {
            const r = Math.random();
            if (r > 0.66) return 'XRXR';
            if (r > 0.33) return 'XRXr';
            return 'XrXr';
        }
    };
    
    const randomWing = () => {
        const options = ['VV', 'Vv', 'vv'];
        return options[Math.floor(Math.random() * options.length)];
    };
    
    document.getElementById('maleBody').value = randomGeno();
    document.getElementById('maleEye').value = randomEye('male');
    document.getElementById('maleWing').value = randomWing();
    
    document.getElementById('femaleBody').value = randomGeno();
    document.getElementById('femaleEye').value = randomEye('female');
    document.getElementById('femaleWing').value = randomWing();
    
    updateParentDisplay('male');
    updateParentDisplay('female');
}

function showModal(type) {
    const modal = document.getElementById('modal');
    const body = document.getElementById('modalBody');
    
    if (type === 'about') {
        body.innerHTML = `
            <h2>About DrosoLab</h2>
            <p>DrosoLab is an interactive genetic cross simulator for <em>Drosophila melanogaster</em> 
            (fruit flies), the model organism that revolutionized genetics research.</p>
            
            <h3>Features</h3>
            <ul>
                <li>Autosomal and sex-linked inheritance</li>
                <li>Real-time Punnett square generation</li>
                <li>F1 and F2 generation analysis</li>
                <li>Phenotypic ratio calculations</li>
            </ul>
            
            <h3>History</h3>
            <p>Thomas Hunt Morgan's work with fruit flies at Columbia University (1908-1928) 
            established the chromosome theory of inheritance. The white-eye mutation, discovered 
            in 1910, was the first sex-linked trait identified.</p>
        `;
    }
    
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

// Close modal on outside click
document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target.id === 'modal') closeModal();
});
