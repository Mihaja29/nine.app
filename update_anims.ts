import fs from 'fs';
let dashboard = fs.readFileSync('src/views/dashboard.tsx', 'utf8');

if (!dashboard.includes('modalDirection')) {
  dashboard = dashboard.replace(
    /const \[membreModalStep, setMembreModalStep\] = useState\(1\);/,
    'const [membreModalStep, setMembreModalStep] = useState(1);\n  const [modalDirection, setModalDirection] = useState(1);'
  );
}

dashboard = dashboard.replace(/onClick=\{\(\) => setMembreModalStep\(1\)\}/g, 'onClick={() => { setModalDirection(-1); setMembreModalStep(1); }}');
dashboard = dashboard.replace(/onClick=\{\(\) => setMembreModalStep\(2\)\}/g, 'onClick={() => { setModalDirection(2 > membreModalStep ? 1 : -1); setMembreModalStep(2); }}');
dashboard = dashboard.replace(/onClick=\{\(\) => setMembreModalStep\(3\)\}/g, 'onClick={() => { setModalDirection(3 > membreModalStep ? 1 : -1); setMembreModalStep(3); }}');
dashboard = dashboard.replace(/onClick=\{\(\) => setMembreModalStep\(4\)\}/g, 'onClick={() => { setModalDirection(4 > membreModalStep ? 1 : -1); setMembreModalStep(4); }}');
dashboard = dashboard.replace(/onClick=\{\(\) => setMembreModalStep\(5\)\}/g, 'onClick={() => { setModalDirection(5 > membreModalStep ? 1 : -1); setMembreModalStep(5); }}');
dashboard = dashboard.replace(/onClick=\{\(\) => setMembreModalStep\(6\)\}/g, 'onClick={() => { setModalDirection(6 > membreModalStep ? 1 : -1); setMembreModalStep(6); }}');

// When opening the modal, set modalDirection to 1, and step to 1
dashboard = dashboard.replace(/setMembreModalStep\(1\);/g, 'setModalDirection(1); setMembreModalStep(1);');

dashboard = dashboard.replace(
  /<AnimatePresence initial=\{false\} custom=\{modalDirection\}>/g,
  '<AnimatePresence initial={false} custom={modalDirection}>' // no-op if already replaced
);
dashboard = dashboard.replace(
  /<AnimatePresence initial=\{false\}>/g,
  '<AnimatePresence initial={false} custom={modalDirection}>' 
);
dashboard = dashboard.replace(
  /<AnimatePresence mode="wait" initial=\{false\}>/g,
  '<AnimatePresence initial={false} custom={modalDirection}>' 
);

dashboard = dashboard.replace(
  /<div className="relative overflow-visible h-auto min-h-\[300px\]">/g,
  '<div className="relative overflow-hidden h-auto w-full flex flex-col">'
);

// We replace the motion configs using specific replace
for (let i = 1; i <= 6; i++) {
  // We'll replace the block manually with regex
  const regex = new RegExp(`<motion\\.div\\s+key="step${i}"[^>]*?className="([^"]+)"\\s*>`, 'g');
  dashboard = dashboard.replace(regex, `<motion.div
                    key="step${i}"
                    custom={modalDirection}
                    initial={{ x: modalDirection === 1 ? '100%' : '-100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: modalDirection === 1 ? '-100%' : '100%', opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%' }}
                    transition={{ type: "tween", ease: [0.0, 0.0, 0.2, 1], duration: 0.25 }}
                    className="$1 relative w-full"
                  >`);
}

fs.writeFileSync('src/views/dashboard.tsx', dashboard);
