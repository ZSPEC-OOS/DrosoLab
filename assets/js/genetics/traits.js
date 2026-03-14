/**
 * Kidd Lab — Drosophila Neurogenetics Trait Definitions
 * Axon guidance, neural development, and circuit formation
 */

const TRAITS = {
    // X Chromosome Genes
    white: {
        id: 'white',
        name: 'White',
        symbol: 'w',
        chromosome: 'X',
        position: '1.5',
        inheritance: 'sex-linked',
        wildType: { allele: 'w+', phenotype: 'Red eyes' },
        mutant: { allele: 'w', phenotype: 'White eyes' },
        description: 'ATP-binding cassette transporter. Classic marker for X-linked inheritance.',
        notes: 'w[1118] is standard background for most transgenes'
    },
    
    frazzled: {
        id: 'frazzled',
        name: 'Frazzled',
        symbol: 'fra',
        chromosome: 'X',
        position: '14.0',
        inheritance: 'sex-linked',
        wildType: { allele: 'fra+', phenotype: 'Normal axon guidance' },
        mutants: {
            'fra3': { phenotype: 'Loss of function', strength: 'moderate', defects: ['midline crossing defects', 'motor axon guidance errors'] },
            'fra4': { phenotype: 'Strong loss of function', strength: 'strong', defects: ['severe commissural defects', 'longitudinal tract disruptions'] },
            'fraGAL4': { phenotype: 'GAL4 driver', type: 'tool', pattern: 'frazzled expression pattern' }
        },
        description: 'DCC (Deleted in Colorectal Cancer) ortholog. Netrin receptor for attractive axon guidance.',
        pathway: 'Netrin-Frazzled attractive signaling',
        expression: 'Commissural neurons, motor neurons, some interneurons',
        notes: 'Key lab gene - Frazzled mediates Netrin attraction at the midline'
    },
    
    commissureless: {
        id: 'commissureless',
        name: 'Commissureless',
        symbol: 'comm',
        chromosome: 'X',
        position: '20.0',
        inheritance: 'sex-linked',
        wildType: { allele: 'comm+', phenotype: 'Normal commissure formation' },
        mutants: {
            'commΔN': { phenotype: 'Dominant negative', effect: 'Truncated protein interferes with endogenous Comm' },
            'comm5': { phenotype: 'Loss of function', effect: 'No commissures form' }
        },
        description: 'Required for Robo1 trafficking to growth cone surface. Comm downregulation allows midline crossing.',
        pathway: 'Comm-Robo trafficking',
        notes: 'Comm mutants have no commissures (all axons stay ipsilateral)'
    },
    
    // Chromosome 2 Genes
    robo1: {
        id: 'robo1',
        name: 'Roundabout 1',
        symbol: 'robo',
        chromosome: '2',
        position: '51.0',
        inheritance: 'autosomal',
        wildType: { allele: 'robo+', phenotype: 'Normal midline repulsion' },
        mutants: {
            'robo1': { phenotype: 'Loss of function', defects: ['ectopic midline crossing', 'FasII tract disruption'] },
            'robo2': { phenotype: 'Transheterozygote', viability: 'viable', use: 'recombination mapping' },
            'roboGAL4': { phenotype: 'GAL4 driver', pattern: 'robo1 expression' }
        },
        description: 'Slit receptor. Mediates midline repulsion for longitudinal axons.',
        pathway: 'Slit-Robo repulsive signaling',
        ligand: 'Slit',
        expression: 'Longitudinal axons, never midline cells',
        notes: 'Robo1 prevents recrossing after Comm downregulation'
    },
    
    robo2: {
        id: 'robo2',
        name: 'Roundabout 2',
        symbol: 'robo2',
        chromosome: '2',
        position: '55.0',
        inheritance: 'autosomal',
        wildType: { allele: 'robo2+', phenotype: 'Lateral positioning' },
        mutants: {
            'robo21': { phenotype: 'Loss of function', defects: ['medial shift of lateral axons'] },
            'robo22': { phenotype: 'Strong allele', defects: ['severe lateral tract defects'] }
        },
        description: 'Slit receptor for lateral positioning. Determines medial-lateral tract position.',
        pathway: 'Slit-Robo2 lateral positioning',
        notes: 'Robo2/Robo3 double mutants have severe longitudinal defects'
    },
    
    slit: {
        id: 'slit',
        name: 'Slit',
        symbol: 'sli',
        chromosome: '2',
        position: '43.0',
        inheritance: 'autosomal',
        wildType: { allele: 'sli+', phenotype: 'Midline repellent source' },
        mutants: {
            'sli2': { phenotype: 'Loss of function', defects: ['all axons collapse to midline', 'no longitudinal tracts'] }
        },
        tools: {
            'UAS-sli': { type: 'overexpression', use: 'Ectopic repulsion studies' }
        },
        description: 'Secreted ligand for Robo receptors. Expressed by midline glia.',
        pathway: 'Slit-Robo signaling',
        expression: 'Midline glia',
        notes: 'Slit mutants: all axons collapse at midline (opposite of comm)'
    },
    
    netrinA: {
        id: 'netrinA',
        name: 'Netrin-A',
        symbol: 'NetA',
        chromosome: '2',
        position: '35.0',
        inheritance: 'autosomal',
        wildType: { allele: 'NetA+', phenotype: 'Attractive guidance cue' },
        mutants: {
            'NetAΔ': { phenotype: 'Deletion', defects: ['some commissural guidance defects'] }
        },
        tools: {
            'NetAe': { type: 'ectopic', use: 'Misexpression studies' }
        },
        description: 'Secreted attractive cue for commissural axons. Binds Frazzled.',
        pathway: 'Netrin-Frazzled attraction',
        receptor: 'Frazzled (DCC)',
        notes: 'NetA/NetB double mutants have stronger phenotypes than single'
    },
    
    // Chromosome 3 Genes
    robo3: {
        id: 'robo3',
        name: 'Roundabout 3',
        symbol: 'robo3',
        chromosome: '3',
        position: '61.0',
        inheritance: 'autosomal',
        wildType: { allele: 'robo3+', phenotype: 'Commissure exit' },
        mutants: {
            'robo31': { phenotype: 'Loss of function', defects: ['stalling at midline', 'failure to exit'] }
        },
        tools: {
            'robo3GAL4': { type: 'driver', pattern: 'robo3 expression' }
        },
        description: 'Required for commissural axons to exit midline after crossing.',
        pathway: 'Slit-Robo3 commissure exit',
        notes: 'Robo3 prevents stalling at midline; expressed on post-crossing commissural axons'
    },
    
    derailed: {
        id: 'derailed',
        name: 'Derailed',
        symbol: 'drl',
        chromosome: '3',
        position: '47.0',
        inheritance: 'autosomal',
        wildType: { allele: 'drl+', phenotype: 'Wnt5 repulsion' },
        mutants: {
            'drl2': { phenotype: 'Loss of function', defects: ['anterior commissure defects', 'incorrect targeting'] }
        },
        tools: {
            'drlRed': { type: 'protein trap', use: 'Visualize Drl protein localization' }
        },
        description: 'Wnt5 receptor. Ryk family. Guides anterior commissure and some motor neurons.',
        pathway: 'Wnt5-Derailed signaling',
        ligand: 'Wnt5',
        notes: 'Drl prevents inappropriate anterior-posterior connections'
    },
    
    wnt5: {
        id: 'wnt5',
        name: 'Wnt5',
        symbol: 'Wnt5',
        chromosome: '3',
        position: '28.0',
        inheritance: 'autosomal',
        wildType: { allele: 'Wnt5+', phenotype: 'Repulsive gradient' },
        mutants: {
            'Wnt5Δ': { phenotype: 'Deletion', defects: ['anterior commissure guidance errors'] }
        },
        description: 'Secreted Wnt ligand for Derailed. Anterior-posterior guidance.',
        pathway: 'Wnt5-Derailed repulsion',
        receptor: 'Derailed (Drl)',
        notes: 'Wnt5 forms gradient for anterior commissure guidance'
    },
    
    // GAL4/UAS System
    gal4Drivers: {
        elav: {
            name: 'elav-GAL4',
            expression: 'All neurons (post-mitotic)',
            use: 'Pan-neuronal expression',
            chromosome: '3'
        },
        repo: {
            name: 'repo-GAL4',
            expression: 'Glia (all types)',
            use: 'Glial manipulation',
            chromosome: '2'
        },
        futsch: {
            name: 'futsch-GAL4',
            expression: 'Motor neurons',
            use: 'NMJ and motor axon studies',
            chromosome: '2'
        },
        GMR: {
            name: 'GMR-GAL4',
            expression: 'Photoreceptors and eye disc',
            use: 'Visual system studies',
            chromosome: '2'
        }
    },
    
    uasEffectors: {
        mCD8GFP: {
            name: 'UAS-mCD8::GFP',
            description: 'Membrane-tethered GFP for morphology',
            use: 'Visualize neuron shape and projections'
        },
        tdTomato: {
            name: 'UAS-tdTomato',
            description: 'Red fluorescent protein',
            use: 'Alternative to GFP for dual labeling'
        },
        RNAi: {
            name: 'UAS-RNAi',
            description: 'RNA interference construct',
            use: 'Knockdown of target gene'
        },
        TrpA1: {
            name: 'UAS-TrpA1',
            description: 'Temperature-sensitive cation channel',
            use: 'Thermogenetic neuronal activation (25-30°C)'
        },
        shibire: {
            name: 'UAS-Shi[ts]',
            description: 'Temperature-sensitive dynamin',
            use: 'Block synaptic transmission (restrictive at 30°C)'
        }
    }
};

// Balancer Chromosomes
const BALANCERS = {
    FM7: {
        name: 'FM7',
        chromosome: 'X',
        markers: ['Bar (B)', 'white+ (w+)'],
        description: 'X chromosome balancer with dominant Bar eye and w+ marker',
        recombination: 'suppressed',
        use: 'Maintain X-linked mutations'
    },
    
    CyO: {
        name: 'CyO',
        chromosome: '2',
        markers: ['Curly (Cy)', 'scarlet+ (st+)'],
        phenotype: 'Curly wings (dominant viable)',
        description: 'Second chromosome balancer',
        recombination: 'suppressed',
        use: 'Most common 2nd chrom balancer'
    },
    
    SM6a: {
        name: 'SM6a',
        chromosome: '2',
        markers: ['Cy', 'wg[Sp-1]'],
        description: 'Alternative 2nd chromosome balancer'
    },
    
    TM3: {
        name: 'TM3',
        chromosome: '3',
        markers: ['Ser (Serrate)', 'Sb (Stubble)'],
        phenotype: 'Stubble bristles (dominant)',
        description: 'Third chromosome balancer with Sb marker',
        recombination: 'suppressed',
        use: 'Sb is easy visible marker'
    },
    
    TM6B: {
        name: 'TM6B',
        chromosome: '3',
        markers: ['Tb (Tubby)', 'Hu (Humeral)'],
        phenotype: 'Tubby (shorter, broader)',
        description: 'Alternative 3rd chromosome balancer',
        use: 'Tb is distinctive dominant marker'
    },
    
    TM6C: {
        name: 'TM6C',
        chromosome: '3',
        markers: ['Tb', 'cu (curly)'],
        description: 'Third chromosome balancer'
    }
};

// Common Stock Genotypes (Kidd Lab specific)
const LAB_STOCKS = [
    {
        id: 'KIDD-001',
        genotype: 'w[1118]',
        description: 'Standard wild-type background with white eyes',
        type: 'background',
        source: 'BDSC #3605'
    },
    {
        id: 'KIDD-002',
        genotype: 'fra[3]',
        description: 'Frazzled loss of function',
        type: 'mutant',
        chromosome: 'X',
        source: 'Kidd Lab collection'
    },
    {
        id: 'KIDD-003',
        genotype: 'fra[GAL4]',
        description: 'Frazzled promoter driving GAL4',
        type: 'driver',
        chromosome: 'X',
        use: 'Target fra-expressing neurons'
    },
    {
        id: 'KIDD-004',
        genotype: 'robo[1]',
        description: 'Robo1 loss of function',
        type: 'mutant',
        chromosome: '2',
        phenotype: 'Ectopic midline crossing'
    },
    {
        id: 'KIDD-005',
        genotype: 'robo[2]',
        description: 'Robo2 loss of function',
        type: 'mutant',
        chromosome: '2'
    },
    {
        id: 'KIDD-006',
        genotype: 'robo[1] robo[2]',
        description: 'Robo1/Robo2 double mutant',
        type: 'mutant',
        viability: 'lethal',
        note: 'Requires balancer maintenance'
    },
    {
        id: 'KIDD-007',
        genotype: 'sli[2]',
        description: 'Slit loss of function',
        type: 'mutant',
        chromosome: '2',
        phenotype: 'Collapse to midline'
    },
    {
        id: 'KIDD-008',
        genotype: 'comm[ΔN]',
        description: 'Dominant negative Comm',
        type: 'tool',
        chromosome: 'X',
        use: 'Block Robo surface expression'
    },
    {
        id: 'KIDD-009',
        genotype: 'robo[3]',
        description: 'Robo3 loss of function',
        type: 'mutant',
        chromosome: '3',
        phenotype: 'Midline stalling'
    },
    {
        id: 'KIDD-010',
        genotype: 'drl[2]',
        description: 'Derailed loss of function',
        type: 'mutant',
        chromosome: '3',
        phenotype: 'Anterior commissure defects'
    },
    {
        id: 'KIDD-011',
        genotype: 'w[*]; P{w[+mC]=UAS-mCD8::GFP.L}LL5',
        description: 'UAS-mCD8::GFP on chromosome 3',
        type: 'effector',
        chromosome: '3',
        use: 'Membrane labeling with GAL4'
    },
    {
        id: 'KIDD-012',
        genotype: 'w[*]; P{w[+mC]=elav-GAL4.L}3',
        description: 'Pan-neuronal GAL4 driver',
        type: 'driver',
        chromosome: '3',
        use: 'Express in all neurons'
    },
    {
        id: 'KIDD-013',
        genotype: 'CyO/Sco; TM3/TM6B',
        description: 'Double balancer stock',
        type: 'balancer',
        use: 'Maintaining 2nd and 3rd chrom mutations'
    },
    {
        id: 'KIDD-014',
        genotype: 'w[1118]; P{w[+mC]=GMR-GAL4}1',
        description: 'Eye-specific GAL4',
        type: 'driver',
        use: 'Visual system experiments'
    },
    {
        id: 'KIDD-015',
        genotype: 'fra[3]/Y; TM3/TM6B',
        description: 'Frazzled mutant males over balancers',
        type: 'maintenance',
        use: 'Generate fra mutant males'
    }
];

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TRAITS, BALANCERS, LAB_STOCKS };
}
