import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

console.log('🚀 Navigating to game...');
await page.goto('http://localhost:5173/#game', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);

// 난이도 선택 (초급)
const diffBtn = page.locator('button:has-text("초급")').first();
if (await diffBtn.isVisible({ timeout: 3000 })) {
    await diffBtn.click();
    await page.waitForTimeout(500);
}

// 발사 버튼
const launchBtn = page.locator('button:has-text("발사")').first();
if (await launchBtn.isVisible({ timeout: 3000 })) {
    await launchBtn.click();
    await page.waitForTimeout(1000);
}

// 시작 버튼
const startBtn = page.locator('button:has-text("시작")').first();
if (await startBtn.isVisible({ timeout: 3000 })) {
    await startBtn.click();
    await page.waitForTimeout(1000);
}

console.log('⏱️ Measuring frames for 15 seconds...');

const result = await page.evaluate(() => {
    return new Promise((resolve) => {
        const frameTimes = [];
        let lastTime = performance.now();
        let running = true;

        function loop() {
            if (!running) return;
            const now = performance.now();
            const delta = now - lastTime;
            frameTimes.push(delta);
            lastTime = now;
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);

        setTimeout(() => {
            running = false;

            const totalFrames = frameTimes.length;
            const avgDelta = frameTimes.reduce((a, b) => a + b, 0) / totalFrames;
            const avgFps = 1000 / avgDelta;
            const maxDelta = Math.max(...frameTimes);
            const minDelta = Math.min(...frameTimes);

            // Jank = frames > 25ms (below 40fps)
            const jankFrames = frameTimes.filter(d => d > 25).length;
            const jankRate = (jankFrames / totalFrames * 100);

            // Critical jank = frames > 100ms
            const criticalJank = frameTimes.filter(d => d > 100).length;

            // FPS distribution
            const below30 = frameTimes.filter(d => d > 33.3).length;
            const between30and60 = frameTimes.filter(d => d >= 16.7 && d <= 33.3).length;
            const above60 = frameTimes.filter(d => d < 16.7).length;

            // Consecutive drops (3+ frames in a row > 25ms)
            let consecutiveDrops = 0;
            let streak = 0;
            for (const d of frameTimes) {
                if (d > 25) {
                    streak++;
                } else {
                    if (streak >= 3) consecutiveDrops++;
                    streak = 0;
                }
            }
            if (streak >= 3) consecutiveDrops++;

            resolve({
                totalFrames,
                avgFps: avgFps.toFixed(1),
                avgDelta: avgDelta.toFixed(1),
                maxDelta: maxDelta.toFixed(1),
                minDelta: minDelta.toFixed(1),
                jankRate: jankRate.toFixed(2),
                criticalJank,
                consecutiveDrops,
                fpsDistribution: {
                    below30,
                    between30and60,
                    above60
                }
            });
        }, 15000);
    });
});

console.log('\n📊 === FRAME DROP ANALYSIS RESULTS ===');
console.log(`Total Frames: ${result.totalFrames}`);
console.log(`Average FPS: ${result.avgFps}`);
console.log(`Average Frame Time: ${result.avgDelta}ms`);
console.log(`Max Frame Time: ${result.maxDelta}ms`);
console.log(`Min Frame Time: ${result.minDelta}ms`);
console.log(`Jank Rate (>25ms): ${result.jankRate}%`);
console.log(`Critical Jank (>100ms): ${result.criticalJank}`);
console.log(`Consecutive Drop Patterns (3+): ${result.consecutiveDrops}`);
console.log(`\nFPS Distribution:`);
console.log(`  >60 FPS: ${result.fpsDistribution.above60} frames`);
console.log(`  30-60 FPS: ${result.fpsDistribution.between30and60} frames`);
console.log(`  <30 FPS: ${result.fpsDistribution.below30} frames`);

await browser.close();
