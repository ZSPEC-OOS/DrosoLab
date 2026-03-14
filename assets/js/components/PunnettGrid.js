/**
 * DrosoLab — Punnett Grid Component
 * Renders interactive Punnett squares
 */

class PunnettGrid {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }
    
    render(crossData, options = {}) {
        const { gametes1, gametes2, offspring } = crossData;
        const { showProbabilities = true, size = 'normal' } = options;
        
        // Determine grid size
        const uniqueG1 = this.getUniqueGametes(gametes1);
        const uniqueG2 = this.getUniqueGametes(gametes2);
        
        const rows = uniqueG1.length;
        const cols = uniqueG2.length;
        
        // Set grid class
        this.container.className = `punnett-grid size-${rows}x${cols} ${size}`;
        this.container.innerHTML = '';
        
        // Empty corner cell
        this.addCell('', 'header');
        
        // Column headers (female gametes)
        for (const g of uniqueG2) {
            this.addCell(g.display, 'gamete');
        }
        
        // Row headers and data
        for (const g1 of uniqueG1) {
            // Row header (male gamete)
            this.addCell(g1.display, 'gamete');
            
            // Offspring cells
            for (const g2 of uniqueG2) {
                const genotype = this.combine(g1, g2);
                const offKey = Object.keys(offspring).find(k => 
                    offspring[k].genotype.string === genotype
                );
                const off = offKey ? offspring[offKey] : null;
                
                this.addOffspringCell(genotype, off, showProbabilities);
            }
        }
    }
    
    getUniqueGametes(gametes) {
        const seen = new Set();
        return gametes.filter(g => {
            const key = g.display;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }
    
    combine(g1, g2) {
        // Simple combination logic
        const body = this.sortAlleles(g1.body, g2.body, 'E');
        const eye = this.sortAlleles(g1.eye, g2.eye, 'R');
        const wing = this.sortAlleles(g1.wing, g2.wing, 'V');
        return `${body} ${eye} ${wing}`;
    }
    
    sortAlleles(a1, a2, dominant) {
        if (a1 === dominant && a2 !== dominant) return dominant + a2.toLowerCase();
        if (a2 === dominant && a1 !== dominant) return dominant + a1.toLowerCase();
        if (a1 === a2) return a1 + a2;
        return a1 + a2;
    }
    
    addCell(content, type) {
        const cell = document.createElement('div');
        cell.className = `punnett-cell ${type}`;
        cell.textContent = content;
        this.container.appendChild(cell);
        return cell;
    }
    
    addOffspringCell(genotype, offspring, showProb) {
        const cell = document.createElement('div');
        cell.className = 'punnett-cell offspring';
        
        if (offspring) {
            const pheno = offspring.phenotype;
            cell.setAttribute('data-phenotype', pheno.description);
            
            let html = '';
            
            if (showProb) {
                html += `<span class="probability-badge">${offspring.percentage}%</span>`;
            }
            
            html += `<div class="cell-genotype">${this.formatGenotype(offspring.genotype)}</div>`;
            html += `<div class="cell-phenotype">${pheno.shortDesc}</div>`;
            
            cell.innerHTML = html;
            
            // Add visual indicator class
            if (pheno.category === 'Wild Type') {
                cell.style.borderColor = 'var(--accent-primary)';
            } else if (pheno.category.includes('Mutant')) {
                cell.style.borderColor = 'var(--accent-secondary)';
            }
        } else {
            cell.textContent = genotype;
        }
        
        this.container.appendChild(cell);
    }
    
    formatGenotype(genotype) {
        // Format with classes for styling
        const bodyClass = genotype.body[0] === genotype.body[1] ? 
            (genotype.body[0] === 'E' ? 'homozygous-dom' : 'homozygous-rec') : 'heterozygous';
        
        return `
            <span class="trait ${bodyClass}">${genotype.body}</span>
            <span class="trait">${genotype.eye}</span>
            <span class="trait">${genotype.wing}</span>
        `;
    }
    
    clear() {
        this.container.innerHTML = '';
    }
}
