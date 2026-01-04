import PillHighlightList from '../PillHighlightList';

export default function TechStack({ data }) {
    return (
        <div className="space-y-4">
            {data.tech?.frontend && (
                <div className="space-y-2">
                    <div className="text-emerald-50/80 text-sm font-semibold">Frontend</div>
                    <PillHighlightList 
                        textArray={(data.tech?.frontend ?? [])}
                        className=''
                    />
                </div>
            )}

            {data.tech?.backend && (
                <div className="space-y-2">
                    <div className="text-emerald-50/80 text-sm font-semibold">Backend</div>
                    <PillHighlightList 
                        textArray={(data.tech?.backend ?? [])}
                        className=''
                    />
                </div>
            )}

            {data.tech?.data && (
                <div className="space-y-2">
                    <div className="text-emerald-50/80 text-sm font-semibold">Data</div>
                    <PillHighlightList 
                        textArray={(data.tech?.data ?? [])}
                        className=''
                    />
                </div>
            )}

            {data.tech?.infra && (
                <div className="space-y-2">
                    <div className="text-emerald-50/80 text-sm font-semibold">Infrastructure</div>
                    <PillHighlightList 
                        textArray={(data.tech?.infra ?? [])}
                        className=''
                    />
                </div>
            )}
        </div>
    );
}