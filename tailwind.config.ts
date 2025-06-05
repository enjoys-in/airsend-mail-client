/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				brand: {
					DEFAULT: 'hsl(var(--brand))',
					foreground: 'hsl(var(--brand-foreground))'
				},
				highlight: {
					DEFAULT: 'hsl(var(--highlight))',
					foreground: 'hsl(var(--highlight-foreground))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				dotFlow: {
					'0%': { transform: 'translateX(-100%) scale(0.8)', opacity: '0' },
					'25%': { transform: 'translateX(0) scale(1.2)', opacity: '1' },
					'50%': { transform: 'translateX(100%) scale(0.8)', opacity: '0.6' },
					'100%': { transform: 'translateX(200%) scale(0.6)', opacity: '0' },
				  },
				  pulseDot: {
					'0%, 100%': { opacity: 0.3, transform: 'scale(0.9)' },
					'50%': { opacity: 1, transform: 'scale(1.2)' },
				  },
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				dotFlow: 'dotFlow 1.5s ease-in-out infinite',
				'pulse-dot': 'pulseDot 1s infinite ease-in-out',
			},
			fontFamily: {
				heading: [
					'var(--font-heading)',
					'ui-sans-serif',
					'-apple-system',
					'BlinkMacSystemFont',
					'Segoe UI Variable Display',
					'Segoe UI',
					'Helvetica',
					'Apple Color Emoji',
					'Arial',
					'sans-serif',
					'Segoe UI Emoji',
					'Segoe UI Symbol',
					'Noto Color Emoji'
				],
				mono: [
					'var(--font-mono)',
					...require("tailwindcss/defaultTheme").fontFamily.mono
				],
				sans: [
					'var(--font-sans)',
					'ui-sans-serif',
					'-apple-system',
					'BlinkMacSystemFont',
					'Segoe UI Variable Display',
					'Segoe UI',
					'Helvetica',
					'Apple Color Emoji',
					'Arial',
					'sans-serif',
					'Segoe UI Emoji',
					'Segoe UI Symbol',
					'Noto Color Emoji'
				]
			}
		}
	},
	plugins: [require("tailwindcss-animate"), require("tailwind-scrollbar-hide")],
};
