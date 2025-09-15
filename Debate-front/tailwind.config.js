module.exports = {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}', // 🟢 모든 React 컴포넌트 파일을 스캔하도록 설정
    ],
    theme: {
        extend: {
            colors: {
                // globals.css의 CSS 변수들을 Tailwind의 유틸리티로 사용 가능하게 매핑
                // 예시: primary: "hsl(var(--primary))"
                // Shadcn UI는 이 부분을 자동으로 설정해주거나, CSS 변수를 직접 사용합니다.
                // 현재 globals.css는 var()를 직접 사용하므로 이 부분은 필요 없을 수도 있습니다.
            },
            borderRadius: {
                lg: `var(--radius)`,
                md: `calc(var(--radius) - 2px)`,
                sm: `calc(var(--radius) - 4px)`,
            },
            fontSize: {
                // globals.css의 --text-xxl 변수를 Tailwind의 폰트 크기로 매핑
                // 예시: '2xl': 'var(--text-2xl)',
            },
            fontFamily: {
                // sans: ["var(--font-sans)"], // 폰트 변수가 있다면
            },
        },
    },
    plugins: [
        // Shadcn UI에서 사용하는 플러그인들을 여기에 추가
        // require("tailwindcss-animate"),
    ],
};
