import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { DescriptionAnalyzer, ScenarioMatcher, ScenarioGenerator } from '@synthkit/ai';

export function createAICommand(): Command {
  const ai = new Command('ai');
  ai.description('AI-powered scenario analysis and generation');

  // synthkit ai analyze
  ai.command('analyze')
    .description('Analyze a business description using AI')
    .argument('[description]', 'Business description to analyze')
    .option('-i, --interactive', 'Interactive mode with prompts')
    .option('-v, --verbose', 'Show detailed analysis output')
    .option('--json', 'Output results as JSON')
    .action(async (description: string | undefined, options) => {
      try {
        let businessDescription = description;

        // If no description provided, prompt for it
        if (!businessDescription) {
          const answers = await inquirer.prompt([
            {
              type: 'input',
              name: 'description',
              message: 'Enter your business/app description:',
              validate: (input: string) => {
                if (!input.trim()) {
                  return 'Please enter a description';
                }
                return true;
              }
            }
          ]);
          businessDescription = answers.description;
        }

        console.log(chalk.blue('🤖 Analyzing your business description with AI...'));
        console.log(chalk.gray(`Description: "${businessDescription}"`));
        console.log();

        const analyzer = new DescriptionAnalyzer();
        const startTime = Date.now();
        const result = await analyzer.analyze(businessDescription || '');
        const totalTime = Date.now() - startTime;

        if (options.json) {
          console.log(JSON.stringify(result, null, 2));
          return;
        }

        // Display results in a user-friendly format
        console.log(chalk.green('✅ Analysis Complete!'));
        console.log(chalk.gray(`Processing time: ${totalTime}ms`));
        console.log();

        const { analysis } = result;
        if (!analysis) {
          console.error(chalk.red('Error: Failed to analyze business description'));
          process.exit(1);
        }

        // Business Context
        console.log(chalk.bold.cyan('📊 Business Context'));
        console.log(`  ${chalk.yellow('Type:')} ${analysis.businessContext.type}`);
        console.log(`  ${chalk.yellow('Stage:')} ${analysis.businessContext.stage}`);
        console.log(`  ${chalk.yellow('Monetization:')} ${analysis.businessContext.monetizationModel}`);
        console.log(`  ${chalk.yellow('Target Audience:')} ${analysis.businessContext.targetAudience.join(', ')}`);
        console.log(`  ${chalk.yellow('Primary Features:')} ${analysis.businessContext.primaryFeatures.join(', ')}`);
        console.log();

        // Key Features
        console.log(chalk.bold.cyan('🔧 Key Features'));
        analysis.keyFeatures.forEach((feature: any) => {
          console.log(`  • ${feature}`);
        });
        console.log();

        // User Roles
        console.log(chalk.bold.cyan('👥 User Roles'));
        analysis.userRoles.forEach((role: any) => {
          console.log(`  • ${role}`);
        });
        console.log();

        // Entities
        console.log(chalk.bold.cyan('🗃️  Data Entities'));
        analysis.entities.forEach((entity: any) => {
          console.log(`  • ${chalk.bold(entity.name)} (${entity.type})`);
          if (entity.relationships.length > 0) {
            console.log(`    ${chalk.gray('→ Related to:')} ${entity.relationships.join(', ')}`);
          }
          console.log(`    ${chalk.gray('→ Volume:')} ${entity.estimatedVolume}`);
        });
        console.log();

        // Confidence & Reasoning
        console.log(chalk.bold.cyan('🎯 Analysis Quality'));
        console.log(`  ${chalk.yellow('Confidence:')} ${(analysis.confidence * 100).toFixed(0)}%`);
        if (options.verbose && analysis.reasoning.length > 0) {
          console.log(`  ${chalk.yellow('Reasoning:')}`);
          analysis.reasoning.forEach((reason: any) => {
            console.log(`    • ${reason}`);
          });
        }
        console.log();

        // Next steps suggestion
        console.log(chalk.bold.green('🚀 Next Steps'));
        console.log(`  Run ${chalk.cyan('synthkit scenario list')} to see existing scenarios`);
        console.log(`  Or ${chalk.cyan('synthkit scenario create')} to build a custom scenario`);

        if (options.interactive) {
          console.log();
          const nextAction = await inquirer.prompt([
            {
              type: 'list',
              name: 'action',
              message: 'What would you like to do next?',
              choices: [
                { name: 'List existing scenarios', value: 'list' },
                { name: 'Create new scenario', value: 'create' },
                { name: 'Exit', value: 'exit' }
              ]
            }
          ]);

          if (nextAction.action === 'list') {
            console.log(chalk.blue('💡 Tip: Run `synthkit scenario list` to see available scenarios'));
          } else if (nextAction.action === 'create') {
            console.log(chalk.blue('💡 Tip: Run `synthkit scenario create` to build a custom scenario'));
          }
        }

      } catch (error) {
        console.error(chalk.red('❌ Error analyzing description:'));
        if (error instanceof Error) {
          console.error(chalk.red(error.message));
        } else {
          console.error(chalk.red('Unknown error occurred'));
        }
        process.exit(1);
      }
    });

  // synthkit ai match
  ai.command('match')
    .description('Find existing scenarios that match your business description')
    .argument('[description]', 'Business description to match against scenarios')
    .option('-v, --verbose', 'Show detailed matching information')
    .option('--json', 'Output results as JSON')
    .action(async (description: string | undefined, options) => {
      try {
        let businessDescription = description;

        if (!businessDescription) {
          const answers = await inquirer.prompt([
            {
              type: 'input',
              name: 'description',
              message: 'Enter your business/app description:',
              validate: (input: string) => {
                if (!input.trim()) {
                  return 'Please enter a description';
                }
                return true;
              }
            }
          ]);
          businessDescription = answers.description;
        }

        console.log(chalk.blue('🔍 Finding matching scenarios...'));
        console.log(chalk.gray(`Description: "${businessDescription}"`));
        console.log();

        // First analyze the description
        const analyzer = new DescriptionAnalyzer();
        const analysis = await analyzer.analyze(businessDescription || '');

        if (!analysis.success) {
          console.error(chalk.red('❌ Failed to analyze description'));
          process.exit(1);
        }

        // Then find matches
        const matcher = new ScenarioMatcher();
        const matchResult = await matcher.findMatches(analysis?.analysis!);

        if (options.json) {
          console.log(JSON.stringify(matchResult, null, 2));
          return;
        }

        // Display results
        if (matchResult.matches.length === 0) {
          console.log(chalk.yellow('🤷 No matching scenarios found'));
          console.log();
          console.log(chalk.bold.cyan('💡 Recommendation'));
          console.log('  Consider creating a custom scenario for your unique business needs');
          console.log(`  Run ${chalk.cyan('synthkit ai generate')} to create a new scenario`);
        } else {
          console.log(chalk.green(`✅ Found ${matchResult.matches.length} matching scenarios`));
          console.log();

          // Show best match prominently
          if (matchResult.bestMatch) {
            const best = matchResult.bestMatch;
            console.log(chalk.bold.cyan('🏆 Best Match'));
            console.log(`  ${chalk.bold(best.scenario.name)} (${best.scenario.packName})`);
            console.log(`  ${chalk.gray(best.scenario.description || 'No description available')}`);
            console.log(`  ${chalk.yellow('Confidence:')} ${Math.round(best.confidence * 100)}%`);
            if (options.verbose) {
              console.log(`  ${chalk.yellow('Reasons:')}`);
              best.reasons.forEach(reason => {
                console.log(`    • ${reason}`);
              });
            }
            console.log();
          }

          // Show other matches
          if (matchResult.matches.length > 1) {
            console.log(chalk.bold.cyan('📋 Other Matches'));
            matchResult.matches.slice(1).forEach((match, index) => {
              console.log(`  ${index + 2}. ${chalk.bold(match.scenario.name)} (${Math.round(match.confidence * 100)}%)`);
              console.log(`     ${chalk.gray(match.scenario.description || 'No description available')}`);
              if (options.verbose && match.reasons.length > 0) {
                console.log(`     ${chalk.gray('→')} ${match.reasons[0]}`);
              }
            });
            console.log();
          }

          // Show recommendation
          if (matchResult.recommendNewScenario) {
            console.log(chalk.bold.yellow('💡 Recommendation'));
            console.log('  While we found some matches, your business has unique characteristics');
            console.log(`  Consider running ${chalk.cyan('synthkit ai generate')} for a custom scenario`);
          } else {
            console.log(chalk.bold.green('💡 Recommendation'));
            console.log(`  Use the ${chalk.cyan(matchResult.bestMatch?.scenario.name)} scenario`);
            console.log(`  Run ${chalk.cyan(`synthkit scenario activate ${matchResult.bestMatch?.scenario.id}`)} to get started`);
          }
        }

        // Show reasoning
        if (options.verbose && matchResult.reasoning.length > 0) {
          console.log();
          console.log(chalk.bold.cyan('🧠 Analysis Reasoning'));
          matchResult.reasoning.forEach(reason => {
            console.log(`  • ${reason}`);
          });
        }

      } catch (error) {
        console.error(chalk.red('❌ Error finding matching scenarios:'));
        if (error instanceof Error) {
          console.error(chalk.red(error.message));
        } else {
          console.error(chalk.red('Unknown error occurred'));
        }
        process.exit(1);
      }
    });

  // synthkit ai generate
  ai.command('generate')
    .description('Generate a new custom scenario for your business')
    .argument('[description]', 'Business description to generate scenario from')
    .option('-o, --output <path>', 'Output directory for generated pack')
    .option('--json', 'Output results as JSON')
    .action(async (description: string | undefined, options) => {
      try {
        let businessDescription = description;

        if (!businessDescription) {
          const answers = await inquirer.prompt([
            {
              type: 'input',
              name: 'description',
              message: 'Enter your business/app description:',
              validate: (input: string) => {
                if (!input.trim()) {
                  return 'Please enter a description';
                }
                return true;
              }
            }
          ]);
          businessDescription = answers.description;
        }

        console.log(chalk.blue('🏗️  Generating custom scenario...'));
        console.log(chalk.gray(`Description: "${businessDescription}"`));
        console.log();

        // First analyze the description
        const analyzer = new DescriptionAnalyzer();
        const analysis = await analyzer.analyze(businessDescription || '');

        if (!analysis.success) {
          console.error(chalk.red('❌ Failed to analyze description'));
          process.exit(1);
        }

        // Generate the scenario
        const generator = new ScenarioGenerator();
        const generationResult = await generator.generateScenario(analysis?.analysis!);

        if (options.json) {
          console.log(JSON.stringify(generationResult, null, 2));
          return;
        }

        if (!generationResult.success) {
          console.error(chalk.red('❌ Failed to generate scenario'));
          if (generationResult.error) {
            console.error(chalk.red(generationResult.error));
          }
          process.exit(1);
        }

        // Display results
        console.log(chalk.green('✅ Custom scenario generated successfully!'));
        console.log();

        if (generationResult.pack) {
          const pack = generationResult.pack;
          console.log(chalk.bold.cyan('📦 Generated Pack'));
          console.log(`  ${chalk.bold(pack.name)} (${pack.id})`);
          console.log(`  ${chalk.gray(pack.description)}`);
          console.log(`  ${chalk.yellow('Schemas:')} ${Object.keys(pack.schemas).length}`);
          console.log(`  ${chalk.yellow('Scenarios:')} ${Object.keys(pack.scenarios).length}`);
          console.log(`  ${chalk.yellow('Personas:')} ${Object.keys(pack.personas).length}`);
          console.log();
        }

        if (generationResult.scenario) {
          const scenario = generationResult.scenario;
          console.log(chalk.bold.cyan('🎭 Generated Scenario'));
          console.log(`  ${chalk.bold(scenario.name)} (${scenario.id})`);
          console.log(`  ${chalk.gray(scenario.description)}`);
          console.log(`  ${chalk.yellow('Data Volumes:')}`);
          Object.entries(scenario.config.volume).forEach(([entity, volume]) => {
            console.log(`    • ${entity}: ${volume.toLocaleString()}`);
          });
          console.log();
        }

        if (generationResult.personas && generationResult.personas.length > 0) {
          console.log(chalk.bold.cyan('👤 Generated Personas'));
          generationResult.personas.forEach(persona => {
            console.log(`  • ${chalk.bold(persona.name)} (${persona.id})`);
            console.log(`    ${chalk.gray(persona.description)}`);
          });
          console.log();
        }

        // Show reasoning and suggestions
        if (generationResult.reasoning.length > 0) {
          console.log(chalk.bold.cyan('🧠 Generation Details'));
          generationResult.reasoning.forEach(reason => {
            console.log(`  • ${reason}`);
          });
          console.log();
        }

        if (generationResult.suggestions.length > 0) {
          console.log(chalk.bold.yellow('💡 Next Steps'));
          generationResult.suggestions.forEach(suggestion => {
            console.log(`  • ${suggestion}`);
          });
          console.log();
        }

        // Output file information
        if (options.output) {
          console.log(chalk.bold.green('📁 Output'));
          console.log(`  Generated pack saved to: ${chalk.cyan(options.output)}`);
          console.log(`  Run ${chalk.cyan('synthkit pack validate')} to verify the generated pack`);
        } else {
          console.log(chalk.bold.green('📁 Next Steps'));
          console.log(`  Use ${chalk.cyan('--output <path>')} to save the generated pack to disk`);
          console.log(`  Or copy the JSON output to create your custom pack manually`);
        }

      } catch (error) {
        console.error(chalk.red('❌ Error generating scenario:'));
        if (error instanceof Error) {
          console.error(chalk.red(error.message));
        } else {
          console.error(chalk.red('Unknown error occurred'));
        }
        process.exit(1);
      }
    });

  return ai;
}
