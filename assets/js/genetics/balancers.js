/**
 * Kidd Lab — Balancer Chromosome Manager
 * Handles balancer segregation and stock maintenance
 */

class BalancerManager {
    constructor() {
        this.balancers = BALANCERS;
        this.rules = {
            // Balancers never recombine with standard chromosomes
            recombinationRate: 0,
            
            // Balancer homozygotes are typically lethal or sterile
            homozygousLethal: ['CyO', 'TM3', 'TM6B', 'FM7'],
            
            // Dominant markers for each balancer
            markers: {
                'CyO': { name: 'Curly', phenotype: 'curly wings', viable: true },
                'TM3': { name: 'Stubble', phenotype: 'short, stubbly bristles', viable: true },
                'TM6B': { name: 'Tubby', phenotype: 'short, wide body', viable: true },
                'FM7': { name: 'Bar', phenotype: 'bar-shaped eyes', viable: true }
            }
        };
    }
    
    /**
     * Check if genotype contains balancers
     */
    hasBalancer(genotype, balancerName = null) {
        if (balancerName) {
            return genotype.includes(balancerName);
        }
        return Object.keys(this.balancers).some(b => genotype.includes(b));
    }
    
    /**
     * Get visible phenotype from balancers
     */
    getBalancerPhenotype(genotype) {
        const phenotypes = [];
        
        for (const [name, data] of Object.entries(this.balancers)) {
            if (genotype.includes(name)) {
                phenotypes.push(data.markers.join(', '));
            }
        }
        
        return phenotypes.join('; ');
    }
    
    /**
     * Predict progeny from balancer cross
     */
    predictBalancerCross(parent1, parent2) {
        const p1Balancers = this.extractBalancers(parent1);
        const p2Balancers = this.extractBalancers(parent2);
        
        const progeny = [];
        
        // For each chromosome with balancers, predict 1:1 segregation
        [2, 3].forEach(chromNum => {
            const p1HasBalancer = p1Balancers[chromNum];
            const p2HasBalancer = p2Balancers[chromNum];
            
            if (p1HasBalancer || p2HasBalancer) {
                progeny.push(...this.calculateSegregation(chromNum, p1HasBalancer, p2HasBalancer));
            }
        });
        
        return progeny;
    }
    
    extractBalancers(genotype) {
        const balancers = { 2: null, 3: null };
        
        if (genotype.includes('CyO')) balancers[2] = 'CyO';
        if (genotype.includes('TM3')) balancers[3] = 'TM3';
        if (genotype.includes('TM6')) balancers[3] = 'TM6';
        
        return balancers;
    }
    
    calculateSegregation(chromosome, p1Bal, p2Bal) {
        const outcomes = [];
        
        if (p1Bal && !p2Bal) {
            // Balancer / wild-type cross
            outcomes.push(
                { genotype: `${p1Bal}/+`, ratio: '1/2', marker: this.rules.markers[p1Bal].phenotype },
                { genotype: '+/+', ratio: '1/2', marker: 'wild-type' }
            );
        } else if (!p1Bal && p2Bal) {
            outcomes.push(
                { genotype: `${p2Bal}/+`, ratio: '1/2', marker: this.rules.markers[p2Bal].phenotype },
                { genotype: '+/+', ratio: '1/2', marker: 'wild-type' }
            );
        } else if (p1Bal && p2Bal) {
            // Balancer / Balancer cross - check if same or different
            if (p1Bal === p2Bal) {
                // Same balancer - 1/4 homozygous lethal, 2/4 balanced, 1/4 wild-type
                outcomes.push(
                    { genotype: `${p1Bal}/${p1Bal}`, ratio: '1/4', viable: false, reason: 'Homozygous balancer lethal' },
                    { genotype: `${p1Bal}/+`, ratio: '2/4', marker: this.rules.markers[p1Bal].phenotype },
                    { genotype: '+/+', ratio: '1/4', marker: 'wild-type' }
                );
            } else {
                // Different balancers (e.g., TM3/TM6B)
                outcomes.push(
                    { genotype: `${p1Bal}/${p2Bal}`, ratio: '1/4', marker: `${this.rules.markers[p1Bal].name} + ${this.rules.markers[p2Bal].name}` },
                    { genotype: `${p1Bal}/+`, ratio: '1/4', marker: this.rules.markers[p1Bal].phenotype },
                    { genotype: `${p2Bal}/+`, ratio: '1/4', marker: this.rules.markers[p2Bal].phenotype },
                    { genotype: '+/+', ratio: '1/4', marker: 'wild-type' }
                );
            }
        }
        
        return outcomes;
    }
    
    /**
     * Generate stock maintenance recommendations
     */
    getMaintenanceStrategy(stockGenotype) {
        const strategies = [];
        
        if (this.hasBalancer(stockGenotype)) {
            strategies.push({
                type: 'balancer',
                description: 'Maintain over balancer to prevent recombination',
                cross: 'Select against balancer phenotype every generation',
                note: 'Never allow balancer homozygotes'
            });
        }
        
        if (stockGenotype.includes('fra') || stockGenotype.includes('robo')) {
            strategies.push({
                type: 'screen',
                description: 'Molecular or phenotypic confirmation recommended',
                method: 'PCR or antibody staining for guidance defects'
            });
        }
        
        return strategies;
    }
}

const Balancer = new BalancerManager();
