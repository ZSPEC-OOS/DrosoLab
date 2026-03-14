/**
 * DrosoLab — Trait Definitions
 * Mendelian genetics data for Drosophila melanogaster
 */

const TRAITS = {
    body: {
        id: 'body',
        name: 'Body Color',
        gene: 'E',
        chromosome: '3',
        inheritance: 'autosomal',
        wildType: {
            allele: 'E',
            phenotype: 'Gray',
            description: 'Wild-type grayish-tan body color'
        },
        mutant: {
            allele: 'e',
            phenotype: 'Ebony',
            description: 'Dark black body color'
        },
        dominance: 'complete'
    },
    
    eye: {
        id: 'eye',
        name: 'Eye Color',
        gene: 'R',
        chromosome: 'X',
        inheritance: 'sex-linked',
        wildType: {
            allele: 'R',
            phenotype: 'Red',
            description: 'Bright red eye color'
        },
        mutant: {
            allele: 'r',
            phenotype: 'White',
            description: 'White eye color'
        },
        dominance: 'complete',
        note: 'Located on X chromosome. Males are hemizygous (X^R Y or X^r Y).'
    },
    
    wing: {
        id: 'wing',
        name: 'Wing Type',
        gene: 'V',
        chromosome: '2',
        inheritance: 'autosomal',
        wildType: {
            allele: 'V',
            phenotype: 'Long',
            description: 'Normal long wings capable of flight'
        },
        mutant: {
            allele: 'v',
            phenotype: 'Vestigial',
            description: 'Shortened, non-functional wings'
        },
        dominance: 'complete'
    }
};

const PHENOTYPES = {
    // Body colors
    'E': { type: 'body', display: 'Gray', class: 'gray-body' },
    'e': { type: 'body', display: 'Ebony', class: 'ebony-body' },
    
    // Eye colors
    'R': { type: 'eye', display: 'Red', class: 'red-eye' },
    'r': { type: 'eye', display: 'White', class: 'white-eye' },
    
    // Wing types
    'V': { type: 'wing', display: 'Long', class: 'long-wing' },
    'v': { type: 'wing', display: 'Vestigial', class: 'vestigial-wing' }
};

// Export for modules or global use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TRAITS, PHENOTYPES };
}
