/**
 * DrosoLab — Statistics Panel Component
 * Renders outcome statistics cards
 */

class StatsPanel {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }
    
    render(crossData) {
        const { offspring, total } = crossData;
        
        // Group by phenotype category
        const groups = this.groupByPhenotype(offspring);
        
        this.container.innerHTML = '';
        
        // Sort by percentage descending
        const sortedGroups = Object.entries(groups).sort((a, b) => 
            b[1].totalProbability - a[1].totalProbability
        );
        
        for (const [category, data] of sortedGroups) {
            const card = this.createCard(category, data, total);
            this.container.appendChild(card);
        }
    }
    
    groupByPhenotype(offspring) {
        const groups = {};
        
        for (const key in offspring) {
            const off = offspring[key];
            const cat = off.phenotype.category;
            
            if (!groups[cat]) {
                groups[cat] = {
                    phenotypes: off.phenotype,
                    genotypes: new Set(),
                    totalCount: 0,
                    totalProbability: 0
                };
            }
            
            groups[cat].genotypes.add(off.genotype.string);
            groups[cat].totalCount += off.count;
            groups[cat].totalProbability += off.probability;
        }
        
        return groups;
    }
    
    createCard(category, data, total) {
        const card = document.createElement('div');
        card.className = 'stat-card';
        
        const percentage = (data.totalProbability * 100).toFixed(1);
        const genotypes = Array.from(data.genotypes).join(', ');
        
        card.innerHTML = `
            <div class="stat-percentage">${percentage}%</div>
            <div class="stat-label">${category}</div>
            <div class="stat-genotype" title="${genotypes}">${genotypes}</div>
        `;
        
        // Color coding
        if (category === 'Wild Type') {
            card.style.borderLeft = '3px solid var(--accent-primary)';
        } else if (category.includes('Mutant')) {
            card.style.borderLeft = '3px solid var(--accent-secondary)';
        }
        
        return card;
    }
    
    clear() {
        this.container.innerHTML = '';
    }
}
