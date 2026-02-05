/**
 * Domain Filter - Simple category/domain selector
 */

import { Domain, ALL_DOMAINS, DOMAIN_LABELS, DOMAIN_COLORS, DOMAIN_BG_COLORS } from '../types';

interface DomainFilterProps {
    activeDomain: Domain | null;
    onDomainChange: (domain: Domain | null) => void;
}

export function DomainFilter({ activeDomain, onDomainChange }: DomainFilterProps) {
    return (
        <div className="flex flex-wrap gap-2 justify-center">
            {/* All button */}
            <button
                onClick={() => onDomainChange(null)}
                className={`px-3 py-1.5 text-sm font-medium rounded border transition-colors ${activeDomain === null
                        ? 'bg-cyber-green/20 text-cyber-green border-cyber-green/40'
                        : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
            >
                All
            </button>
            {/* Domain buttons */}
            {ALL_DOMAINS.map((domain) => {
                const isActive = activeDomain === domain;
                const color = DOMAIN_COLORS[domain];
                const bgColor = DOMAIN_BG_COLORS[domain];

                return (
                    <button
                        key={domain}
                        onClick={() => onDomainChange(isActive ? null : domain)}
                        className="px-3 py-1.5 text-sm font-medium rounded border transition-colors"
                        style={{
                            color: isActive ? color : '#9ca3af',
                            backgroundColor: isActive ? bgColor : 'rgba(255,255,255,0.05)',
                            borderColor: isActive ? `${color}40` : 'rgba(255,255,255,0.1)',
                        }}
                    >
                        {DOMAIN_LABELS[domain]}
                    </button>
                );
            })}
        </div>
    );
}
