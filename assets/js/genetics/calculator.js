/**
 * Kidd Lab — Advanced Genetic Cross Calculator
 * Handles neurogenetics crosses, balancers, and viability calculations
 */

class GeneticCalculator {
    constructor() {
        this.traits = TRAITS;
        this.balancers = BALANCERS;
        this.stocks = LAB_STOCKS;
        this.viabilityRules = this.initViabilityRules();
    }
    
    initViabilityRules() {
        return {
            // Lethal genotypes
            lethal: [
                { gene: 'comm', genotype: 'commΔN/commΔN', reason: 'Dominant negative homozygote' },
                { gene: 'comm', genotype: 'comm5/comm5', reason: 'Null allele homozygote' },
                { gene: 'sli', genotype: 'sli2/sli2', reason: 'Slit null - midline collapse' },
                { gene: 'fra', genotype: 'fra4/fra4', reason: 'Strong fra allele - severe guidance defects' },
                { pattern: /robo1.*robo1.*robo2.*robo2/, reason: 'Robo1/Robo2 double homozygote lethal' }
            ],
            
            // Sterile genotypes
            sterile: [
                { pattern: /w\[\*\].*w\[\*\]/, sex: 'male', reason: 'White-eyed males often sterile in some backgrounds' }
            ]
        };
    }
    
    /**
     * Parse complex genotype string
     */
    parseGenotype(genotypeStr, sex) {
        const result = {
            sex,
            chromosomes: { X: [], 2: [], 3: [], 4: [] },
            balancers: [],
            transgenes: [],
            markers: []
        };
        
        // Split by semicolons for different chromosomes
        const parts = genotypeStr.split(';').map(p => p.trim());
        
        parts.forEach(part => {
            // Check for balancers
            if (part.includes('CyO')) {
                result.balancers.push('CyO');
                result.markers.push('Curly');
                result.chromosomes[2].push({ type: 'balancer', name: 'CyO' });
            }
            if (part.includes('TM3')) {
                result.balancers.push('TM3');
                result.markers.push('Stubble');
                result.chromosomes[3].push({ type: 'balancer', name: 'TM3' });
            }
            if (part.includes('TM6')) {
                result.balancers.push('TM6');
                result.markers.push('Tubby');
                result.chromosomes[3].push({ type: 'balancer', name: 'TM6' });
            }
            
            // Check for transgenes (P{...} or specific patterns)
            const transgeneMatch = part.match(/P\{([^}]+)\}/);
            if (transgeneMatch) {
                result.transgenes.push(transgeneMatch[1]);
            }
            
            // Parse gene mutations
            this.parseGenePart(part, result);
        });
        
        return result;
    }
    
    parseGenePart(part, result) {
        // White eye (w)
        if (part.includes('w[') || part === 'w' || part.includes('X^w')) {
            if (part.includes('w+') || part.includes('w[+]')) {
                result.markers.push('Red eyes');
                result.chromosomes.X.push({ gene: 'white', allele: 'w+', dominant: true });
            } else {
                result.markers.push('White eyes');
                result.chromosomes.X.push({ gene: 'white', allele: 'w', recessive: true });
            }
        }
        
        // Frazzled
        if (part.toLowerCase().includes('fra')) {
            if (part.includes('fra3')) {
                result.chromosomes.X.push({ gene: 'fra', allele: 'fra3', type: 'LOF' });
            } else if (part.includes('fra4')) {
                result.chromosomes.X.push({ gene: 'fra', allele: 'fra4', type: 'strong LOF' });
            } else if (part.includes('fraGAL4')) {
                result.chromosomes.X.push({ gene: 'fra', allele: 'fraGAL4', type: 'tool' });
                result.transgenes.push('fra-GAL4');
            }
        }
        
        // Robo1
        if (part.match(/robo[^2]/)) {
            if (part.includes('robo1')) {
                result.chromosomes[2].push({ gene: 'robo1', allele: 'robo1', type: 'LOF' });
            } else if (part.includes('robo+')) {
                result.chromosomes[2].push({ gene: 'robo1', allele: 'robo+', type: 'WT' });
            }
        }
        
        // Robo2
        if (part.includes('robo2')) {
            if (part.includes('robo21') || part.includes('robo2[1]')) {
                result.chromosomes[2].push({ gene: 'robo2', allele: 'robo21', type: 'LOF' });
            }
        }
        
        // Robo3
        if (part.includes('robo3')) {
            if (part.includes('robo31')) {
                result.chromosomes[3].push({ gene: 'robo3', allele: 'robo31', type: 'LOF' });
            }
        }
        
        // Slit
        if (part.includes('sli')) {
            if (part.includes('sli2')) {
                result.chromosomes[2].push({ gene: 'slit', allele: 'sli2', type: 'LOF' });
            }
        }
        
        // Comm
        if (part.includes('comm')) {
            if (part.includes('commΔN')) {
                result.chromosomes.X.push({ gene: 'comm', allele: 'commΔN', type: 'dominant negative' });
            } else if (part.includes('comm5')) {
                result.chromosomes.X.push({ gene: 'comm', allele: 'comm5', type: 'LOF' });
            }
        }
        
        // GAL4/UAS
        if (part.includes('GAL4')) {
            const match = part.match(/(\w+)-GAL4/);
            if (match) {
                result.transgenes.push(`${match[1]}-GAL4`);
                result.chromosomes[2].push({ type: 'GAL4', driver: match[1] });
            }
        }
        
        if (part.includes('UAS-')) {
            const match = part.match(/UAS-(\w+)/);
            if (match) {
                result.transgenes.push(`UAS-${match[1]}`);
            }
        }
    }
    
    /**
     * Generate gametes considering balancers
     */
    generateGametes(parsedGenotype, includeBalancers = true) {
        const gametes = [];
        const chroms = parsedGenotype.chromosomes;
        
        // Simple case: no balancers
        if (parsedGenotype.balancers.length === 0) {
            return this.generateSimpleGametes(chroms, parsedGenotype.sex);
        }
        
        // With balancers: 50% chance of each chromosome type
        const combinations = this.generateBalancerCombinations(chroms, includeBalancers);
        
        combinations.forEach(combo => {
            gametes.push({
                chromosomes: combo,
                display: this.formatGamete(combo),
                probability: 0.5 // Simplified for balancer segregation
            });
        });
        
        return gametes;
    }
    
    generateSimpleGametes(chroms, sex) {
        const gametes = [];
        
        // X chromosome possibilities
        const xPossibilities = chroms.X.length > 0 ? chroms.X : [{ gene: 'wild-type', allele: '+' }];
        
        // Autosome 2
        const chrom2Possibilities = chroms[2].length > 0 ? this.getChromosomeAlleles(chroms[2]) : [['+']];
        
        // Autosome 3
        const chrom3Possibilities = chroms[3].length > 0 ? this.getChromosomeAlleles(chroms[3]) : [['+']];
        
        // Generate all combinations
        xPossibilities.forEach(x => {
            chrom2Possibilities.forEach(c2 => {
                chrom3Possibilities.forEach(c3 => {
                    gametes.push({
                        X: x,
                        2: c2,
                        3: c3,
                        sexChrom: sex === 'male' ? 'Y' : 'X',
                        display: this.formatSimpleGamete(x, c2, c3, sex),
                        probability: 1 / (xPossibilities.length * chrom2Possibilities.length * chrom3Possibilities.length)
                    });
                });
            });
        });
        
        return gametes;
    }
    
    getChromosomeAlleles(chromGenes) {
        // For heterozygous chromosomes, return both possibilities
        const alleles = chromGenes.map(g => g.allele || g);
        // Simplified: assume independent assortment
        return [alleles]; // Return as array of possibilities
    }
    
    generateBalancerCombinations(chroms, includeBalancers) {
        const combinations = [];
        
        // For each chromosome with balancer, 50% WT chromosome, 50% balancer
        // This is simplified - real implementation would be more complex
        
        if (includeBalancers) {
            combinations.push({ ...chroms, hasBalancer: true });
        }
        combinations.push({ ...chroms, hasBalancer: false });
        
        return combinations;
    }
    
    formatGamete(combo) {
        // Format for display
        return 'Gamete';
    }
    
    formatSimpleGamete(x, c2, c3, sex) {
        const xStr = typeof x === 'object' ? x.allele || x.gene : x;
        const c2Str = Array.isArray(c2) ? c2.join('') : c2;
        const c3Str = Array.isArray(c3) ? c3.join('') : c3;
        return `${xStr}; ${c2Str}; ${c3Str}`;
    }
    
    /**
     * Perform cross between two parents
     */
    cross(parent1, parent2) {
        const p1 = typeof parent1 === 'string' ? this.parseGenotype(parent1, 'male') : parent1;
        const p2 = typeof parent2 === 'string' ? this.parseGenotype(parent2, 'female') : parent2;
        
        const gametes1 = this.generateGametes(p1);
        const gametes2 = this.generateGametes(p2);
        
        const offspring = {};
        let total = 0;
        
        // Calculate all combinations
        gametes1.forEach(g1 => {
            gametes2.forEach(g2 => {
                const zygote = this.combineGametes(g1, g2, p1.sex, p2.sex);
                const key = zygote.genotypeString;
                
                if (!offspring[key]) {
                    offspring[key] = {
                        genotype: zygote,
                        count: 0,
                        sexes: { male: 0, female: 0 }
                    };
                }
                
                offspring[key].count++;
                offspring[key].sexes[zygote.sex]++;
                total++;
            });
        });
        
        // Calculate probabilities and check viability
        for (const key in offspring) {
            const off = offspring[key];
            off.probability = off.count / total;
            off.percentage = (off.probability * 100).toFixed(1);
            off.viability = this.checkViability(off.genotype);
            off.phenotype = this.determinePhenotype(off.genotype);
        }
        
        return {
            offspring,
            total,
            parent1: p1,
            parent2: p2,
            gametes1,
            gametes2
        };
    }
    
    combineGametes(g1, g2, sex1, sex2) {
        // Determine offspring sex
        const sex = g1.sexChrom === 'Y' ? 'male' : 'female';
        
        // Combine chromosomes
        const combined = {
            sex,
            chromosomes: {
                X: [g1.X, g2.X],
                2: [...(g1[2] || []), ...(g2[2] || [])],
                3: [...(g1[3] || []), ...(g2[3] || [])]
            }
        };
        
        // Create genotype string
        const genotypeString = this.createGenotypeString(combined);
        
        return {
            ...combined,
            genotypeString,
            parentGametes: { p1: g1, p2: g2 }
        };
    }
    
    createGenotypeString(genotype) {
        // Format full genotype
        const parts = [];
        
        // X chromosome
        const xAlleles = genotype.chromosomes.X.map(x => typeof x === 'object' ? x.allele : x);
        if (genotype.sex === 'male') {
            parts.push(`${xAlleles[0]}/Y`);
        } else {
            parts.push(`${xAlleles[0]}/${xAlleles[1] || '+'}`);
        }
        
        // Autosomes
        [2, 3].forEach(chrom => {
            const alleles = genotype.chromosomes[chrom];
            if (alleles.length > 0) {
                const unique = [...new Set(alleles.map(a => typeof a === 'object' ? a.allele : a))];
                parts.push(unique.join('/'));
            }
        });
        
        return parts.join('; ');
    }
    
    checkViability(genotype) {
        const genotypeStr = genotype.genotypeString;
        
        // Check lethal rules
        for (const rule of this.viabilityRules.lethal) {
            if (rule.pattern && rule.pattern.test(genotypeStr)) {
                return { viable: false, reason: rule.reason };
            }
            if (rule.genotype && genotypeStr.includes(rule.genotype)) {
                return { viable: false, reason: rule.reason };
            }
        }
        
        return { viable: true };
    }
    
    determinePhenotype(genotype) {
        const markers = [];
        const defects = [];
        let category = 'Wild-type';
        
        // Check for visible markers
        if (genotype.chromosomes.X.some(x => x.allele === 'w' || x === 'w')) {
            markers.push('White eyes');
        } else {
            markers.push('Red eyes');
        }
        
        // Check for balancers
        if (genotype.chromosomes[2].some(g => g.type === 'balancer')) {
            markers.push('Curly wings');
        }
        if (genotype.chromosomes[3].some(g => g.name && g.name.includes('TM'))) {
            if (genotype.chromosomes[3].some(g => g.name === 'TM3')) {
                markers.push('Stubble');
            } else {
                markers.push('Tubby');
            }
        }
        
        // Check for guidance defects
        const hasFraMut = genotype.chromosomes.X.some(x => x.allele && x.allele.includes('fra') && !x.allele.includes('GAL4'));
        const hasRobo1Mut = genotype.chromosomes[2].some(g => g.allele === 'robo1');
        const hasSliMut = genotype.chromosomes[2].some(g => g.allele === 'sli2');
        const hasCommMut = genotype.chromosomes.X.some(x => x.allele && x.allele.includes('comm'));
        
        if (hasFraMut) {
            defects.push('Frazzled guidance defects');
            category = 'Frazzled mutant';
        }
        if (hasRobo1Mut) {
            defects.push('Robo1 ectopic crossing');
            category = 'Robo1 mutant';
        }
        if (hasSliMut) {
            defects.push('Slit midline collapse');
            category = 'Slit mutant';
        }
        if (hasCommMut) {
            defects.push('Commissureless - no commissures');
            category = 'Comm mutant';
        }
        
        return {
            markers: markers.join(', '),
            defects: defects,
            category,
            description: markers.join(', ')
        };
    }
    
    /**
     * Calculate F2 from F1 intercross
     */
    calculateF2(f1Data, crossType = 'intercross') {
        // Get F1 genotypes
        const f1Genotypes = Object.keys(f1Data.offspring);
        
        if (crossType === 'intercross') {
            // Cross F1 males to F1 females
            // Simplified: use most common F1 genotype
            const mainF1 = f1Genotypes[0];
            return this.cross(mainF1, mainF1);
        } else if (crossType === 'testcross') {
            // Cross to w[1118]
            return this.cross(f1Genotypes[0], 'w[1118]');
        }
        
        return null;
    }
}

// Create global instance
const Calc = new GeneticCalculator();
