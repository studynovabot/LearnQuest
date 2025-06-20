// Initialize sample data for the application
import { parseQAFromText, saveQAToJSONL } from '../utils/simple-qa-parser.js';
import fs from 'fs/promises';
import path from 'path';

console.log('🚀 Initializing Sample NCERT Data...');

async function initializeSampleData() {
  try {
    // Sample PDF metadata
    const metadata = {
      board: 'CBSE',
      class: '10',
      subject: 'Science',
      chapter: 'Chemical Reactions And Equations'
    };

    // Sample text content (as would be extracted from the PDF)
    const sampleTextContent = `
Q1. What is a chemical reaction?
A chemical reaction is a process in which one or more substances, called reactants, are converted to one or more different substances, called products. Substances have different chemical composition in reactants and products.

Q2. Give an example of a chemical reaction.
Rusting of iron is a chemical reaction. When iron comes in contact with oxygen and moisture, it forms iron oxide (rust). The chemical equation is: 4Fe + 3O2 + 6H2O → 4Fe(OH)3

Q3. What are the signs of a chemical reaction?
The signs of a chemical reaction include: 1. Change in color 2. Evolution of gas 3. Formation of precipitate 4. Change in temperature 5. Change in smell

Q4. What is the law of conservation of mass?
The law of conservation of mass states that mass can neither be created nor destroyed in a chemical reaction. The total mass of reactants equals the total mass of products.

Q5. What is a balanced chemical equation?
A balanced chemical equation is one in which the number of atoms of each element is equal on both sides of the equation.

Q6. Balance the following chemical equation: H2 + O2 → H2O
The balanced equation is: 2H2 + O2 → 2H2O. This ensures that there are equal numbers of hydrogen and oxygen atoms on both sides.

Q7. What is an oxidation reaction?
An oxidation reaction is a reaction in which a substance gains oxygen or loses hydrogen. For example, when magnesium burns in air: 2Mg + O2 → 2MgO

Q8. What is a reduction reaction?
A reduction reaction is a reaction in which a substance loses oxygen or gains hydrogen. For example, when copper oxide is heated with hydrogen: CuO + H2 → Cu + H2O

Q9. What is a displacement reaction?
A displacement reaction is a reaction in which one element displaces another element from its compound. For example: Zn + CuSO4 → ZnSO4 + Cu

Q10. What is a double displacement reaction?
A double displacement reaction is a reaction in which two compounds exchange their ions to form two new compounds. For example: AgNO3 + NaCl → AgCl + NaNO3

Q11. What is an exothermic reaction?
An exothermic reaction is a reaction that releases heat energy. The temperature of the surroundings increases. For example: C + O2 → CO2 + Heat

Q12. What is an endothermic reaction?
An endothermic reaction is a reaction that absorbs heat energy. The temperature of the surroundings decreases. For example: CaCO3 + Heat → CaO + CO2

Q13. What is a catalyst?
A catalyst is a substance that increases the rate of a chemical reaction without being consumed in the reaction. It provides an alternative pathway with lower activation energy.

Q14. Give an example of a catalyst used in industry.
Iron is used as a catalyst in the Haber process for the manufacture of ammonia: N2 + 3H2 → 2NH3 (in presence of Fe catalyst)

Q15. What is corrosion?
Corrosion is the process of gradual destruction of materials (usually metals) by chemical reaction with their environment. Rusting of iron is a common example of corrosion.
    `;

    console.log('📄 Processing sample content...');

    // Extract Q&A pairs using simple parser
    const qaPairs = parseQAFromText(sampleTextContent, metadata);
    
    console.log(`✅ Extracted ${qaPairs.length} Q&A pairs`);

    // Create solution data structure
    const solutionId = 'cbse-class10-science-chemical-reactions';
    const solutionData = {
      id: solutionId,
      metadata,
      qaPairs,
      filename: 'NCERT Solutions Class 10 Science Chapter 1.pdf',
      fileSize: 290680,
      totalQuestions: qaPairs.length,
      processedAt: new Date().toISOString(),
      status: 'active'
    };

    // Save individual JSONL file
    const jsonlPath = path.join(process.cwd(), 'processed-qa', `${solutionId}.jsonl`);
    await saveQAToJSONL(qaPairs, jsonlPath);

    // Save complete solution data
    const solutionPath = path.join(process.cwd(), 'processed-qa', `${solutionId}-complete.json`);
    await fs.writeFile(solutionPath, JSON.stringify(solutionData, null, 2), 'utf-8');

    console.log(`\n✅ Sample data initialization completed!`);
    console.log(`📁 JSONL file: ${jsonlPath}`);
    console.log(`📁 Solution data: ${solutionPath}`);
    console.log(`📊 Total Q&A pairs: ${qaPairs.length}`);
    console.log(`🔖 Solution ID: ${solutionId}`);

    // Display final structure
    console.log('\n📋 Solution Data Structure:');
    console.log(JSON.stringify({
      id: solutionData.id,
      metadata: solutionData.metadata,
      totalQuestions: solutionData.totalQuestions,
      status: solutionData.status,
      sampleQA: qaPairs[0]
    }, null, 2));

    return solutionData;

  } catch (error) {
    console.error('❌ Initialization failed:', error);
    throw error;
  }
}

// Run the initialization
initializeSampleData()
  .then(() => console.log('\n🎉 Ready to test the API!'))
  .catch(error => console.error('💥 Failed:', error));