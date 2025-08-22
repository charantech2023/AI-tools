import React, { useState } from 'react';
import { AnalysisResult as AnalysisResultType } from '../types';
import { IntentIcon } from './icons/IntentIcon';
import { KeyTakeawaysIcon } from './icons/KeyTakeawaysIcon';
import { LinkIcon } from './icons/LinkIcon';
import { StatsIcon } from './icons/StatsIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ProTipsIcon } from './icons/ProTipsIcon';
import { ConclusionIcon } from './icons/ConclusionIcon';
import { InfoIcon } from './icons/InfoIcon';
import { CopyIcon } from './icons/CopyIcon';


interface AnalysisResultProps {
  data: AnalysisResultType;
}

const ResultCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode, titleAddon?: React.ReactNode }> = ({ title, icon, children, titleAddon }) => (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
            {icon}
            <h2 className="text-xl font-bold text-gray-100">{title}</h2>
            {titleAddon}
        </div>
        <div className="text-gray-300 space-y-4">
            {children}
        </div>
    </div>
);

const generateMarkdown = (data: AnalysisResultType): string => {
    let markdown = `# Webpage Analysis\n\n`;

    markdown += `## Page Intent\n`;
    markdown += `> ${data.pageIntent}\n\n`;

    if (data.keyTakeaways?.length > 0) {
        markdown += `## Key Takeaways\n`;
        data.keyTakeaways.forEach(item => {
            markdown += `* ${item}\n`;
        });
        markdown += `\n`;
    }

    if (data.siblingLinks?.length > 0) {
        markdown += `## Sibling Link Opportunities\n`;
        data.siblingLinks.forEach(link => {
            markdown += `* **Anchor:** [${link.anchorText}](${link.url})\n`;
            markdown += `  * **Nearest Heading:** ${link.placement.nearestHeading}\n`;
            markdown += `  * **Placement Sentence:** "${link.placement.quote}"\n\n`;
        });
    }
    
    if (data.statsAndKeyFacts?.length > 0) {
        markdown += `## Stats & Key Facts\n`;
        data.statsAndKeyFacts.forEach(stat => {
            markdown += `* **${stat.metricAndValue}** (${stat.yearAndGeography})\n`;
            markdown += `  * **Source:** ${stat.sourceCitation}\n\n`;
        });
    }

    if (data.proTips?.length > 0) {
        markdown += `## Pro Tips\n`;
        data.proTips.forEach(tip => {
            markdown += `* **Tip:** ${tip.tip}\n`;
            markdown += `  * **Nearest Heading:** ${tip.placement.nearestHeading}\n`;
            markdown += `  * **Context:** "${tip.placement.quote}"\n\n`;
        });
    }

    if (data.conclusion) {
        markdown += `## Conclusion\n`;
        markdown += `${data.conclusion}\n\n`;
    }

    if (data.aiSEOCapsule) {
        markdown += `## AI/SEO Capsule\n`;
        markdown += `${data.aiSEOCapsule}\n\n`;
    }
    
    return markdown;
};


export const AnalysisResult: React.FC<AnalysisResultProps> = ({ data }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    const markdown = generateMarkdown(data);
    navigator.clipboard.writeText(markdown).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    });
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="flex justify-end">
            <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-200 bg-gray-700/50 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
            >
                <CopyIcon className="w-4 h-4" />
                {isCopied ? 'Copied!' : 'Copy Analysis'}
            </button>
        </div>

      <ResultCard title="Page Intent" icon={<IntentIcon className="w-6 h-6 text-cyan-400"/>}>
        <p className="text-lg italic">"{data.pageIntent}"</p>
      </ResultCard>

      {data.keyTakeaways && data.keyTakeaways.length > 0 && (
        <ResultCard title="Key Takeaways" icon={<KeyTakeawaysIcon className="w-6 h-6 text-teal-400"/>}>
          <ul className="space-y-3 list-disc list-inside">
            {data.keyTakeaways.map((takeaway, index) => (
              <li key={index} className="pl-2 leading-relaxed">{takeaway}</li>
            ))}
          </ul>
        </ResultCard>
      )}

      <ResultCard title="Sibling Link Opportunities" icon={<LinkIcon className="w-6 h-6 text-green-400"/>}>
        {data.siblingLinks.length > 0 ? (
          <ul className="space-y-6">
            {data.siblingLinks.map((link, index) => (
              <li key={index} className="p-4 border border-gray-600 rounded-lg bg-gray-900/50">
                <p className="font-semibold text-green-400">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        Anchor: "{link.anchorText}"
                    </a>
                </p>
                <div className="mt-2 text-sm text-gray-400">
                    <p><strong>Nearest Heading:</strong> {link.placement.nearestHeading}</p>
                    <p className="mt-1"><strong>Placement Sentence:</strong> <em className="text-gray-300">"{link.placement.quote}"</em></p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No strong sibling link opportunities found.</p>
        )}
      </ResultCard>
      
      <ResultCard title="Stats & Key Facts" icon={<StatsIcon className="w-6 h-6 text-yellow-400"/>}>
        {data.statsAndKeyFacts.length > 0 ? (
          <ul className="space-y-4 list-disc list-inside">
            {data.statsAndKeyFacts.map((stat, index) => (
              <li key={index} className="pl-2">
                <span className="font-semibold text-gray-200">{stat.metricAndValue}</span>
                <span className="text-sm text-yellow-400 ml-2">({stat.yearAndGeography})</span>
                <p className="text-xs text-gray-500 mt-1 pl-6">
                  Source: {stat.sourceCitation.startsWith('http') ? <a href={stat.sourceCitation} target="_blank" rel="noopener noreferrer" className="hover:underline">{stat.sourceCitation}</a> : stat.sourceCitation}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No citable statistics were found in the provided content.</p>
        )}
      </ResultCard>

      {data.proTips && data.proTips.length > 0 && (
        <ResultCard title="Pro Tips" icon={<ProTipsIcon className="w-6 h-6 text-orange-400"/>}>
          <ul className="space-y-6">
            {data.proTips.map((proTip, index) => (
               <li key={index} className="p-4 border border-gray-600 rounded-lg bg-gray-900/50">
                <p className="font-semibold text-orange-400">{proTip.tip}</p>
                <div className="mt-2 text-sm text-gray-400">
                    <p><strong>Nearest Heading:</strong> {proTip.placement.nearestHeading}</p>
                    <p className="mt-1"><strong>Context:</strong> <em className="text-gray-300">"{proTip.placement.quote}"</em></p>
                </div>
              </li>
            ))}
          </ul>
        </ResultCard>
      )}

      {data.conclusion && (
        <ResultCard title="Conclusion" icon={<ConclusionIcon className="w-6 h-6 text-rose-400"/>}>
            <p className="leading-relaxed">{data.conclusion}</p>
        </ResultCard>
      )}

      <ResultCard 
        title="AI/SEO Capsule" 
        icon={<SparklesIcon className="w-6 h-6 text-purple-400"/>}
        titleAddon={
            <div className="relative group">
                <InfoIcon className="w-5 h-5 text-gray-500 cursor-pointer" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-gray-900 border border-gray-600 rounded-lg text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <strong>How to use this:</strong> This is a concise, direct answer to a user's potential question, optimized for search engines. Use it as a 'featured snippet', a meta description, or at the top of a blog post for a quick summary.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-600"></div>
                </div>
            </div>
        }
      >
        <p className="leading-relaxed">{data.aiSEOCapsule}</p>
      </ResultCard>

    </div>
  );
};