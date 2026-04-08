gsap.registerPlugin(ScrollTrigger);

const images = gsap.utils.toArray('img');
const loader = document.querySelector('.loader--text');
const updateProgress = (instance) => 
    loader.textContent = `${Math.round(instance.progressedCount * 200 / images.length)}%`;

const showDemo = () => {
    document.body.style.overflow = 'auto';
    document.scrollingElement.scrollTo(0, 0);
    gsap.to(document.querySelector('.loader'), { autoAlpha: 0 });

    let mm = gsap.matchMedia();

    gsap.utils.toArray('section').forEach((section, index) => {
        const w = section.querySelector('.wrapper');
        if (!w) return;

        // 기기별 애니메이션 설정 분리
        mm.add({
            // 분기점 정의
            isDesktop: "(min-width: 1024px)",
            isMobile: "(max-width: 1023px)"
        }, (context) => {
            let { isDesktop, isMobile } = context.conditions;

            // 1. 시작점(From) 수치 설정
            let xStart = () => {
                const winW = window.innerWidth;
                if (w.textContent.includes("Project Archive")) return isDesktop ? winW * -0.2 : winW * -0.1;
                if (w.textContent.includes("Digital Experiences")) return isDesktop ? winW * 0.2 : winW * -0.1;

                if (w.textContent.includes("Crafting Principled")) return isDesktop ? winW * 1.9 : winW * 0.7;
                if (w.textContent.includes("UI through Technical")) return isDesktop ? winW * -0.1 : winW * -0.3;
                if (w.textContent.includes("Integrity and User-")) return isDesktop ? winW * 0.8 : winW * 0.6;
                if (w.textContent.includes("Centric Design")) return isDesktop ? winW * -0.5 : winW * -0.2;
                
                return (index % 2) ? winW : (w.scrollWidth * -1);
            };

            // 2. 종료점(To) 수치 설정
            let xEnd = () => {
                const winW = window.innerWidth;
                if (w.textContent.includes("Project Archive")) return isDesktop ? winW * 0.1 : winW * 0.05;
                if (w.textContent.includes("Digital Experiences")) return isDesktop ? winW * 0.1 : winW * -0.1;

                if (w.textContent.includes("Crafting Principled")) return isDesktop ? winW * 0.1 : winW * -0.02;
                if (w.textContent.includes("UI through Technical")) return isDesktop ? winW * 0.1 : winW * 0.15;
                if (w.textContent.includes("Integrity and User-")) return isDesktop ? winW * -0.1 : winW * -0.1;
                if (w.textContent.includes("Centric Design")) return isDesktop ? winW * 0.4 : winW * 0.3;
                
                return (index % 2) ? (w.scrollWidth - winW + 600) * -1 : 600;
            };

            // 애니메이션 실행
            gsap.fromTo(w, 
                { x: xStart, opacity: 0, skewX: isDesktop ? -20 : -10 }, 
                {
                    x: xEnd,
                    opacity: 1,
                    skewX: 1,
                    scrollTrigger: { 
                        trigger: section, 
                        scrub: 1,
                        invalidateOnRefresh: true
                    }
                }
            );
        });
    });
};

// --- 커서 및 기타 로직 (동일) ---
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');
const lastSection = document.querySelector('.last-section'); // 마지막 섹션 선택

window.addEventListener('mousemove', (e) => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
    gsap.to(follower, { x: e.clientX - 24, y: e.clientY - 24, duration: 0.3 }); // 위치값은 스타일에 맞춰 조정 가능합니다.
});

document.querySelectorAll('img').forEach(img => {
    img.addEventListener('mouseenter', () => follower.classList.add('cursor-active'));
    img.addEventListener('mouseleave', () => follower.classList.remove('cursor-active'));
});

// 마지막 섹션 감지 로직 추가
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // 마지막 섹션에 진입했을 때 클래스 추가
            cursor.classList.add('invert');
            follower.classList.add('invert');
        } else {
            // 벗어났을 때 클래스 제거
            cursor.classList.remove('invert');
            follower.classList.remove('invert');
        }
    });
}, { threshold: 0.1 }); // 섹션이 10% 이상 보일 때 작동

if (lastSection) {
    observer.observe(lastSection);
}

// 갤러리 리빌 효과도 반응형 start 지점 조절 (모바일 고려)
gsap.utils.toArray('.gallery li').forEach((li) => {
    ScrollTrigger.create({
        trigger: li,
        start: "top 50%", 
        onEnter: () => li.classList.add('reveal'),
        once: true 
    });
});

const initBgColorChange = () => {
  // 각 지점별 전환될 테마(배경색, 텍스트색) 정의
  const scrollThemes = [
    { trigger: ".intro", bgColor: "#ffffff", textColor: "#000000" }, // 시작: 화이트 배경 / 블랙 텍스트
    { trigger: ".start", bgColor: "#1a1a1a", textColor: "#ffffff" }, // 갤러리: 블랙 배경 / 화이트 텍스트 (반전)
    { trigger: ".end", bgColor: "#87cd33", textColor: "#000000" }     // 마무리: 그린 배경 / 블랙 텍스트
  ];

  // 테마 전환 통합 함수 (GSAP 애니메이션 로직)
  const changeTheme = (theme) => {
    gsap.to("body", { backgroundColor: theme.bgColor, duration: 0.2 });
    // 모든 .wrapper.text 요소를 한꺼번에 텍스트 색상 전환
    gsap.to(".wrapper.text", { color: theme.textColor, duration: 0.2 });
  };

  scrollThemes.forEach((theme, index) => {
    ScrollTrigger.create({
      trigger: theme.trigger,
      start: "top center", // 섹션 상단이 화면 중앙에 올 때 트리거
      end: "bottom center", // 섹션 하단이 화면 중앙을 떠날 때
      
      // 1. 아래로 내려가며 진입할 때 (정방향 진입)
      onEnter: () => changeTheme(theme),
      
      // 2. 위로 올라오며 다시 진입할 때 (역방향 진입)
      onEnterBack: () => changeTheme(theme),

      // 3. 위로 올라가며 해당 섹션을 완전히 벗어날 때 (역방향 퇴장)
      // 이전 섹션의 테마로 되돌려주는 처리가 필요합니다.
      onLeaveBack: () => {
        if (index > 0) {
          const prevTheme = scrollThemes[index - 1];
          changeTheme(prevTheme);
        }
      }
    });
  });
};

initBgColorChange();

imagesLoaded(images).on('progress', updateProgress).on('always', showDemo);

/*------------------------------
Register plugins
------------------------------*/
gsap.registerPlugin(ScrollTrigger, ScrollSmoother)
const content = document.querySelector('.allWrapper')

/*------------------------------
Making some circles noise
------------------------------*/
const simplex = new SimplexNoise()
for (let i = 0; i < 6000; i++) {
  const div = document.createElement('div')
  div.classList.add('circle')
  const n1 = simplex.noise2D(i * 0.003, i * 0.0033)
  const n2 = simplex.noise2D(i * 0.002, i * 0.001)
  
  const style = {
    transform: `translate(${n2 * 200}px) rotate(${n2 * 270}deg) scale(${3 + n1 * 2}, ${3 + n2 * 2})`,
    boxShadow: `0 0 0 .2px hsla(${Math.floor(i*0.3)}, 70%, 70%, .6)`,
    top: i + "px"
  }
  Object.assign(div.style, style)
  content.appendChild(div)
}
const Circles = document.querySelectorAll('.circle')

/*------------------------------
Init ScrollSmoother
------------------------------*/
const scrollerSmoother = ScrollSmoother.create({
  content: content,
  wrapper: '.layoutContent',
  smooth: 1,
  effects: false
});

/*------------------------------
Scroll Trigger
------------------------------*/
const main = gsap.timeline({
  scrollTrigger: {
    scrub: .7,
    start: "top 75%",
    end: "bottom bottom"
  }
})
Circles.forEach((circle) => {
  main.to(circle, {
    opacity: 1,
  })
})
