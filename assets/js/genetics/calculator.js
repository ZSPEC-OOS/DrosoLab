/**
 * DrosoLab — Genetic Cross Calculator
 * Handles all Mendelian cross computations
 */

class GeneticCalculator {
    constructor() {
        this.traits = TRAITS;
    }
    
    /**
     * Parse genotype string into structured object
     */
    parseGenotype(genotypeStr, sex) {
        // Handle sex-linked eye colors differently
        if (genotypeStr.includes('X')) {
            return this.parseSexLinked(genotypeStr, sex);
        }
        
        // Standard autosomal format: "EE VV" etc.
        const parts = genotypeStr.trim().split(/\s+/);
        const result = { sex };
        
        parts.forEach(part => {
            if (part.toUpperCase().includes('E')) {
                result.body = {
                    alleles: part.split(''),
                    genotype: part,
                    homozygous: part[0] === part[1],
                    dominant: part.includes('E')
                };
            } else if (part.toUpperCase().includes('R') || part.toUpperCase().includes('X')) {
                result.eye = {
                    alleles: this.extractAlleles(part, 'eye'),
                    genotype: part,
                    homozygous: sex === 'female' ? part[0] === part[1] : true,
                    dominant: part.includes('R')
                };
            } else if (part.toUpperCase().includes('V')) {
                result.wing = {
                    alleles: part.split(''),
                    genotype: part,
                    homozygous: part[0] === part[1],
                    dominant: part.includes('V')
                };
            }
        });
        
        return result;
    }
    
    parseSexLinked(genotypeStr, sex) {
        // Format: XRY, XrY (male) or XRXR, XRXr, XrXr (female)
        const result = { sex };
        
        // Extract eye alleles
        if (sex === 'male') {
            const match = genotypeStr.match(/X([Rr])Y/);
            if (match) {
                result.eye = {
                    alleles: [match[1]],
                    genotype: genotypeStr,
                    homozygous: true, // Hemizygous
                    dominant: match[1] === 'R',
                    hemizygous: true
                };
            }
        } else {
            const match = genotypeStr.match(/X([Rr])X([Rr])/);
            if (match) {
                result.eye = {
                    alleles: [match[1], match[2]],
                    genotype: genotypeStr,
                    homozygous: match[1] === match[2],
                    dominant: match[1] === 'R' || match[2] === 'R'
                };
            }
        }
        
        return result;
    }
    
    extractAlleles(part, trait) {
        if (trait === 'eye' && part.includes('X')) {
            const matches = part.match(/[Rr]/g);
            return matches || [];
        }
        return part.split('');
    }
    
    /**
     * Generate all possible gametes from a genotype
     */
    generateGametes(parsedGenotype) {
        const gametes = [];
        
        // Get possible alleles for each trait
        const bodyAlleles = parsedGenotype.body ? parsedGenotype.body.alleles : ['E'];
        const eyeAlleles = parsedGenotype.eye ? parsedGenotype.eye.alleles : ['R'];
        const wingAlleles = parsedGenotype.wing ? parsedGenotype.wing.alleles : ['V'];
        
        // Generate all combinations
        for (const b of bodyAlleles) {
            for (const e of eyeAlleles) {
                for (const w of wingAlleles) {
                    gametes.push({
                        body: b,
                        eye: e,
                        wing: w,
                        display: `${b}${e}${w}`
                    });
                }
            }
        }
        
        return gametes;
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
        const total = gametes1.length * gametes2.length;
        
        for (const g1 of gametes1) {
            for (const g2 of gametes2) {
                const genotype = this.combineGametes(g1, g2, p1.sex, p2.sex);
                const key = genotype.string;
                
                if (!offspring[key]) {
                    offspring[key] = {
                        genotype,
                        count: 0,
                        probability: 0
                    };
                }
                offspring[key].count++;
            }
        }
        
        // Calculate probabilities and phenotypes
        for (const key in offspring) {
            const off = offspring[key];
            off.probability = (off.count / total);
            off.phenotype = this.determinePhenotype(off.genotype);
            off.percentage = (off.probability * 100).toFixed(1);
        }
        
        return {
            offspring,
            total,
            gametes1,
            gametes2,
            parent1: p1,
            parent2: p2
        };
    }
    
    /**
     * Combine two gametes into offspring genotype
     */
    combineGametes(g1, g2, sex1, sex2) {
        // Body (autosomal) - always combine both alleles
        const body = this.sortAlleles(g1.body, g2.body, 'E');
        
        // Eye (sex-linked) - handle specially
        let eye;
        if (sex1 === 'male' && sex2 === 'female') {
            // Male contributes X or Y, female contributes X
            // Simplified: assume we're tracking the X allele
            eye = this.sortAlleles(g1.eye, g2.eye, 'R');
        } else {
            eye = this.sortAlleles(g1.eye, g2.eye, 'R');
        }
        
        // Wing (autosomal)
        const wing = this.sortAlleles(g1.wing, g2.wing, 'V');
        
        const string = `${body} ${eye} ${wing}`;
        
        return {
            body,
            eye,
            wing,
            string,
            components: { body, eye, wing }
        };
    }
    
    sortAlleles(a1, a2, dominant) {
        // Sort so dominant comes first if heterozygous
        if (a1 === dominant && a2 !== dominant) return dominant + a2.toLowerCase();
        if (a2 === dominant && a1 !== dominant) return dominant + a1.toLowerCase();
        if (a1 === a2) return a1 + a2;
        return a1 + a2; // fallback
    }
    
    /**
     * Determine phenotype from genotype
     */
    determinePhenotype(genotype) {
        const traits = [];
        
        // Body
        if (genotype.body.includes('E')) {
            traits.push({ trait: 'Body', phenotype: 'Gray', mutant: false });
        } else {
            traits.push({ trait: 'Body', phenotype: 'Ebony', mutant: true });
        }
        
        // Eye
        if (genotype.eye.includes('R')) {
            traits.push({ trait: 'Eye', phenotype: 'Red', mutant: false });
        } else {
            traits.push({ trait: 'Eye', phenotype: 'White', mutant: true });
        }
        
        // Wing
        if (genotype.wing.includes('V')) {
            traits.push({ trait: 'Wing', phenotype: 'Long', mutant: false });
        } else {
            traits.push({ trait: 'Wing', phenotype: 'Vestigial', mutant: true });
        }
        
        const mutantCount = traits.filter(t => t.mutant).length;
        let category = 'Wild Type';
        if (mutantCount === 3) category = 'Triple Mutant';
        else if (mutantCount === 2) category = 'Double Mutant';
        else if (mutantCount === 1) category = 'Single Mutant';
        
        return {
            traits,
            category,
            description: traits.map(t => `${t.phenotype} ${t.trait.toLowerCase()}`).join(', '),
            shortDesc: traits.map(t => t.phenotype).join(', ')
        };
    }
    
    /**
     * Calculate F2 from F1 self-cross
     */
    calculateF2(f1Genotypes) {
        // Take most common F1 genotype or use provided
        const f1Geno = Array.isArray(f1Genotypes) ? f1Genotypes[0] : f1Genotypes;
        
        // Create F1 parent objects (both sexes same genotype for simplicity)
        const f1Male = this.parseGenotype(f1Geno, 'male');
        const f1Female = this.parseGenotype(f1Geno, 'female');
        
        return this.cross(f1Male, f1Female);
    }
    
    /**
     * Group offspring by phenotype
     */
    groupByPhenotype(offspring) {
        const groups = {};
        
        for (const key in offspring) {
            const off = offspring[key];
            const phenoKey = off.phenotype.category;
            
            if (!groups[phenoKey]) {
                groups[phenoKey] = {
                    phenotypes: off.phenotype,
                    genotypes: [],
                    totalCount: 0,
                    totalProbability: 0
                };
            }
            
            groups[phenoKey].genotypes.push({
                genotype: off.genotype.string,
                count: off.count,
                probability: off.probability
            });
            groups[phenoKey].totalCount += off.count;
            groups[phenoKey].totalProbability += off.probability;
        }
        
        // Calculate percentages
        for (const key in groups) {
            groups[key].percentage = (groups[phenoKey].totalProbability * 100).toFixed(1);
        }
        
        return groups;
    }
}

// Create global instance
const Calc = new GeneticCalculator();
