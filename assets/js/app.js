/**
 * Kidd Lab NeuroCross — Main Application
 * Drosophila neurogenetics cross simulator
 */

// Initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    renderStockList();
    setupEventListeners();
});

function initializeApp() {
    // Set default parents
    updateParentDisplay('male');
    updateParentDisplay('female');
    
    // Initialize tool tabs
    document.querySelectorAll('.tool-tab').forEach(tab => {
        tab.addEventListener('click', () => switchToolTab(tab));
    });
}

function setupEventListeners() {
    // Parent selectors
    ['male', 'female'].forEach(sex => {
        document.querySelectorAll(`#${sex}Card select`).forEach(select => {
            select.addEventListener('change', () => updateParentDisplay(sex));
        });
        
        // Balancer checkboxes
        ['CyO', 'TM3', 'TM6B'].forEach(bal => {
            const cb = document.getElementById(`${sex}${bal}`);
            if (cb) cb.addEventListener('change', () => updateParentDisplay(sex));
        });
    });
    
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
}

function updateParentDisplay(sex) {
    const data = collectGenotypeData(sex);
    const genotypeString = buildGenotypeString(data);
    const phenotype = determinePhenotype(data);
    
    // Update displays
    document.getElementById(`${sex}Genotype`).textContent = genotypeString;
    document.getElementById(`${sex}Markers`).innerHTML = `<strong>Visible Markers:</strong> ${phenotype.markers.join(', ') || 'None'}`;
    
    // Update fly visual
    updateFlyVisual(sex, data, phenotype);
    
    // Check viability
    checkViability(sex, data);
}

function collectGenotypeData(sex) {
    const data = {
        sex,
        X: {
            eye: document.getElementById(`${sex}Eye`).value,
            fra: document.getElementById(`${sex}Fra`)?.value || 'fra+',
            comm: document.getElementById(`${sex}Comm`)?.value || 'comm+'
        },
        chrom2: {
            robo1: document.getElementById(`${sex}Robo1`).value,
            robo2: document.getElementById(`${sex}Robo2`).value,
            slit: document.getElementById(`${sex}Slit`).value,
            netA: document.getElementById(`${sex}NetA`).value,
            cyo: document.getElementById(`${sex}CyO`)?.checked || false
        },
        chrom3: {
            robo3: document.getElementById(`${sex}Robo3`).value,
            drl: document.getElementById(`${sex}Drl`).value,
            wnt5: document.getElementById(`${sex}Wnt5`).value,
            gal4: document.getElementById(`${sex}GAL4`).value,
            uas: document.getElementById(`${sex}UAS`).value,
            tm3: document.getElementById(`${sex}TM3`)?.checked || false,
            tm6b: document.getElementById(`${sex}TM6B`)?.checked || false
        }
    };
    
    return data;
}

function buildGenotypeString(data) {
    const parts = [];
    
    // X chromosome
    let xPart = '';
    if (data.sex === 'male') {
        xPart = data.X.eye; // Already includes Y
    } else {
        // Parse female X
        const eye = data.X.eye.replace(/X/g, '');
        xPart = eye;
    }
    parts.push(xPart);
    
    // Add fra and comm if not wild-type
    if (data.X.fra !== 'fra+') parts[0] += ` ${data.X.fra}`;
    if (data.X.comm !== 'comm+') parts[0] += ` ${data.X.comm}`;
    
    // Chromosome 2
    const chrom2Parts = [];
    if (data.chrom2.robo1 !== 'robo+') chrom2Parts.push(data.chrom2.robo1);
    if (data.chrom2.robo2 !== 'robo2+') chrom2Parts.push(data.chrom2.robo2);
    if (data.chrom2.slit !== 'sli+') chrom2Parts.push(data.chrom2.slit);
    if (data.chrom2.netA !== 'NetA+') chrom2Parts.push(data.chrom2.netA);
    
    if (data.chrom2.cyo) {
        parts.push(chrom2Parts.length > 0 ? `CyO/${chrom2Parts.join(' ')}` : 'CyO/+');
    } else if (chrom2Parts.length > 0) {
        parts.push(chrom2Parts.join(' '));
    }
    
    // Chromosome 3
    const chrom3Parts = [];
    if (data.chrom3.robo3 !== 'robo3+') chrom3Parts.push(data.chrom3.robo3);
    if (data.chrom3.drl !== 'drl+') chrom3Parts.push(data.chrom3.drl);
    if (data.chrom3.wnt5 !== 'Wnt5+') chrom3Parts.push(data.chrom3.wnt5);
    if (data.chrom3.gal4 !== 'noGAL4') chrom3Parts.push(data.chrom3.gal4);
    if (data.chrom3.uas !== 'noUAS') chrom3Parts.push(data.chrom3.uas);
    
    let chrom3Str = '';
    if (data.chrom3.tm3) chrom3Str = 'TM3';
    else if (data.chrom3.tm6b) chrom3Str = 'TM6B';
    
    if (chrom3Parts.length > 0) {
        chrom3Str += chrom3Str ? `/${chrom3Parts.join(' ')}` : chrom3Parts.join(' ');
    } else if (chrom3Str) {
        chrom3Str += '/+';
    }
    
    if (chrom3Str) parts.push(chrom3Str);
    
    return parts.join('; ') || 'w[1118]';
}

function determinePhenotype(data) {
    const markers = [];
    const genes = [];
    
    // Eye color
    if (data.X.eye.includes('w+') || data.X.eye.includes('w[+]')) {
        markers.push('Red eyes');
    } else {
        markers.push('White eyes');
    }
    
    // Balancer markers
    if (data.chrom2.cyo) markers.push('Curly wings');
    if (data.chrom3.tm3) markers.push('Stubble bristles');
    if (data.chrom3.tm6b) markers.push('Tubby body');
    
    // Gene mutations
    if (data.X.fra !== 'fra+') genes.push('Frazzled mutant');
    if (data.X.comm !== 'comm+') genes.push('Comm mutant');
    if (data.chrom2.robo1 !== 'robo+') genes.push('Robo1 mutant');
    if (data.chrom2.slit !== 'sli+') genes.push('Slit mutant');
    
    return { markers, genes };
}

function updateFlyVisual(sex, data, phenotype) {
    const visual = document.getElementById(`${sex}FlyVisual`);
    const info = document.querySelector(`#${sex}Phenotype .phenotype-info`);
    
    // Update classes based on genotype
    visual.className = 'fly-avatar';
    visual.classList.add(data.X.eye.includes('w+') ? 'red-eyes' : 'white-eyes');
    if (data.chrom2.cyo) visual.classList.add('curly');
    
    // Update info
    const name = phenotype.genes.length > 0 ? phenotype.genes.join(', ') : 'Wild-type';
    info.querySelector('strong').textContent = name;
    info.querySelector('span').textContent = phenotype.markers.join(', ') || 'Standard morphology';
    
    // Add genotype tags
    const tagsContainer = document.getElementById(`${sex}Tags`);
    tagsContainer.innerHTML = phenotype.genes.map(g => 
        `<span class="genotype-tag">${g.replace(' mutant', '')}</span>`
    ).join('');
}

function checkViability(sex, data) {
    const alert = document.getElementById(`${sex}Viability`);
    let lethal = false;
    let reason = '';
    
    // Check lethal combinations
    if (data.X.comm === 'commΔN' && sex === 'female') {
        // commΔN/commΔN is lethal
        const commSelect = document.getElementById(`${sex}Comm`);
        if (commSelect.value === 'commΔNcommΔN') {
            lethal = true;
            reason = 'commΔN/commΔN is lethal';
        }
    }
    
    if (data.chrom2.slit === 'sli2sli2') {
        lethal = true;
        reason = 'Slit null homozygotes die';
    }
    
    if (lethal) {
        alert.classList.remove('hidden');
        alert.querySelector('.alert-text').textContent = reason;
    } else {
        alert.classList.add('hidden');
    }
}

function performCross() {
    const maleData = collectGenotypeData('male');
    const femaleData = collectGenotypeData('female');
    
    const maleGeno = buildGenotypeString(maleData);
    const femaleGeno = buildGenotypeString(femaleData);
    
    // Perform calculation
    const result = Calc.cross(maleGeno, femaleGeno);
    
    // Display results
    displayResults(result, maleGeno, femaleGeno);
    
    // Show panel
    const panel = document.getElementById('resultsPanel');
    panel.style.display = 'block';
    panel.classList.add('active');
    panel.scrollIntoView({ behavior: 'smooth' });
}

function displayResults(result, maleGeno, femaleGeno) {
    // Parent display
    const parentsDisplay = document.getElementById('parentsDisplay');
    parentsDisplay.innerHTML = `
        <div class="parent-box">
            <div class="sex">♂</div>
            <div class="genotype">${maleGeno}</div>
            <div class="phenotype">${determinePhenotype(collectGenotypeData('male')).markers.join(', ')}</div>
        </div>
        <div class="cross-symbol">×</div>
        <div class="parent-box">
            <div class="sex">♀</div>
            <div class="genotype">${femaleGeno}</div>
            <div class="phenotype">${determinePhenotype(collectGenotypeData('female')).markers.join(', ')}</div>
        </div>
    `;
    
    // F1 Table
    const tbody = document.getElementById('f1TableBody');
    tbody.innerHTML = '';
    
    Object.entries(result.offspring).forEach(([geno, data]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="genotype-cell">${geno}</td>
            <td class="phenotype-cell">${data.phenotype.description}</td>
            <td>${Object.entries(data.sexes).map(([s, c]) => `${c} ${s}`).join(', ')}</td>
            <td class="ratio-cell">${data.count}/${result.total}</td>
            <td class="percent-cell">${data.percentage}%</td>
            <td class="${data.viability.viable ? 'viability-viable' : 'viability-lethal'}">
                ${data.viability.viable ? '✓ Viable' : `✗ ${data.viability.reason}`}
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Calculate F2
    calculateF2(result);
}

function calculateF2(f1Result) {
    const f2Type = document.getElementById('f2CrossType').value;
    const f2Result = Calc.calculateF2(f1Result, f2Type);
    
    if (!f2Result) return;
    
    // F2 Table
    const tbody = document.getElementById('f2TableBody');
    tbody.innerHTML = '';
    
    Object.entries(f2Result.offspring).forEach(([geno, data]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="genotype-cell">${geno}</td>
            <td class="phenotype-cell">${data.phenotype.category}</td>
            <td>${data.phenotype.markers}</td>
            <td class="ratio-cell">${data.count}/${f2Result.total}</td>
            <td class="percent-cell">${data.percentage}%</td>
            <td>${data.viability.viable ? 'Keep' : 'Discard'}</td>
        `;
        tbody.appendChild(row);
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === `${tabName}Content`));
}

function switchToolTab(tab) {
    document.querySelectorAll('.tool-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
}

function renderStockList() {
    const container = document.getElementById('stockList');
    if (!container) return;
    
    container.innerHTML = LAB_STOCKS.map(stock => `
        <div class="stock-item" onclick="loadStockData('${stock.id}')">
            <div class="stock-number">${stock.id}</div>
            <div class="stock-genotype">${stock.genotype}</div>
            <div class="stock-description">${stock.description}</div>
            <div class="stock-tags">
                <span class="stock-tag">${stock.type}</span>
                ${stock.chromosome ? `<span class="stock-tag">Chr ${stock.chromosome}</span>` : ''}
                ${stock.source ? `<span class="stock-tag">${stock.source}</span>` : ''}
            </div>
        </div>
    `).join('');
}

function randomizeParents() {
    // Randomize all selectors
    ['male', 'female'].forEach(sex => {
        document.querySelectorAll(`#${sex}Card select`).forEach(select => {
            const options = select.querySelectorAll('option');
            select.selectedIndex = Math.floor(Math.random() * options.length);
        });
    });
    
    updateParentDisplay('male');
    updateParentDisplay('female');
}

function clearParents() {
    // Reset to w[1118]
    document.getElementById('maleEye').value = 'XwY';
    document.getElementById('femaleEye').value = 'XwXw';
    
    ['male', 'female'].forEach(sex => {
        ['Robo1', 'Robo2', 'Slit', 'NetA', 'Robo3', 'Drl', 'Wnt5'].forEach(gene => {
            const el = document.getElementById(`${sex}${gene}`);
            if (el) el.selectedIndex = 0;
        });
        
        ['CyO', 'TM3', 'TM6B'].forEach(bal => {
            const el = document.getElementById(`${sex}${bal}`);
            if (el) el.checked = false;
        });
    });
    
    updateParentDisplay('male');
    updateParentDisplay('female');
}

function copyGenotype(sex) {
    const geno = document.getElementById(`${sex}Genotype`).textContent;
    navigator.clipboard.writeText(geno).then(() => {
        alert('Genotype copied to clipboard');
    });
}

function showModal(type) {
    const modal = document.getElementById('modal');
    const body = document.getElementById('modalBody');
    
    if (type === 'about') {
        body.innerHTML = `
            <h2>About Kidd Lab NeuroCross</h2>
            <p>Advanced Drosophila genetics simulator designed for the Kidd Laboratory at the University of Nevada, Reno.</p>
            <h3>Research Focus</h3>
            <ul>
                <li>Axon guidance mechanisms</li>
                <li>Netrin-Frazzled signaling</li>
                <li>Slit-Robo repulsion</li>
                <li>Commissure formation</li>
                <li>Neural circuit assembly</li>
            </ul>
        `;
    } else if (type === 'balancers') {
        body.innerHTML = `
            <h2>Balancer Chromosome Guide</h2>
            <p>Balancers are multiply inverted chromosomes that suppress recombination and carry dominant markers.</p>
            <h3>Common Balancers</h3>
            <ul>
                <li><strong>CyO</strong> - Chromosome 2, Curly wings</li>
                <li><strong>TM3, Sb</strong> - Chromosome 3, Stubble bristles</li>
                <li><strong>TM6B, Tb</strong> - Chromosome 3, Tubby body</li>
                <li><strong>FM7</strong> - X chromosome, Bar eyes</li>
            </ul>
            <p><strong>Rule:</strong> Never allow balancer homozygotes - they are lethal or sterile.</p>
        `;
    }
    
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

function exportNotes() {
    const notes = document.getElementById('expNotes').value;
    const blob = new Blob([notes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `droso-cross-notes-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
}
