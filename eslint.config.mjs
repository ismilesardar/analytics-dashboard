import nextConfig from 'eslint-config-next';

const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      'no-console': 'warn',
      'react-hooks/exhaustive-deps': 'warn'
    }
  },
  {
    // shadcn-managed primitives — not hand-edited per CLAUDE.md, so these
    // stock react-hooks/react-compiler rules are relaxed to warnings here.
    files: ['src/components/ui/**'],
    rules: {
      'react-hooks/purity': 'warn',
      'react/display-name': 'warn'
    }
  }
];

export default eslintConfig;
