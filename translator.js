/**
 * Aksara Jawa Translator
 * Bi-directional translation: Latin ↔ Aksara Jawa
 */

// ==========================================
// Aksara Jawa Character Mappings
// ==========================================

// Basic consonants (Aksara Carakan - Hanacaraka)
const AKSARA_CARAKAN = {
    'ha': 'ꦲ', 'na': 'ꦤ', 'ca': 'ꦕ', 'ra': 'ꦫ', 'ka': 'ꦏ',
    'da': 'ꦢ', 'ta': 'ꦠ', 'sa': 'ꦱ', 'wa': 'ꦮ', 'la': 'ꦭ',
    'pa': 'ꦥ', 'dha': 'ꦝ', 'ja': 'ꦗ', 'ya': 'ꦪ', 'nya': 'ꦚ',
    'ma': 'ꦩ', 'ga': 'ꦒ', 'ba': 'ꦧ', 'tha': 'ꦛ', 'nga': 'ꦔ'
};

// Consonants without inherent vowel (for pasangan)
const AKSARA_PASANGAN = {
    'ha': '꧀ꦲ', 'na': '꧀ꦤ', 'ca': '꧀ꦕ', 'ra': '꧀ꦫ', 'ka': '꧀ꦏ',
    'da': '꧀ꦢ', 'ta': '꧀ꦠ', 'sa': '꧀ꦱ', 'wa': '꧀ꦮ', 'la': '꧀ꦭ',
    'pa': '꧀ꦥ', 'dha': '꧀ꦝ', 'ja': '꧀ꦗ', 'ya': '꧀ꦪ', 'nya': '꧀ꦚ',
    'ma': '꧀ꦩ', 'ga': '꧀ꦒ', 'ba': '꧀ꦧ', 'tha': '꧀ꦛ', 'nga': '꧀ꦔ'
};

// Sandangan (vowel diacritics)
const SANDANGAN = {
    'i': 'ꦶ',      // wulu
    'u': 'ꦸ',      // suku
    'e': 'ꦺ',      // taling (é)
    'è': 'ꦺ',      // taling
    'é': 'ꦺ',      // taling
    'ê': 'ꦼ',      // pepet (e pepet)
    'o': 'ꦺꦴ',     // taling tarung
    'ò': 'ꦺꦴ',     // taling tarung
    'ó': 'ꦺꦴ'      // taling tarung
};

// Aksara Swara (independent vowels)
const AKSARA_SWARA = {
    'a': 'ꦄ',
    'i': 'ꦆ',
    'u': 'ꦈ',
    'e': 'ꦌ',
    'é': 'ꦌ',
    'è': 'ꦌ',
    'ê': 'ꦄꦼ',
    'o': 'ꦎ'
};

// Pangkon (vowel killer)
const PANGKON = '꧀';

// Pada (punctuation)
const PADA = {
    ',': '꧈',
    '.': '꧉',
    ':': '꧇',
    '?': '꧈',
    '!': '꧉'
};

// Numbers
const ANGKA_JAWA = {
    '0': '꧐', '1': '꧑', '2': '꧒', '3': '꧓', '4': '꧔',
    '5': '꧕', '6': '꧖', '7': '꧗', '8': '꧘', '9': '꧙'
};

// Reverse mappings for Jawa to Latin
const CARAKAN_TO_LATIN = Object.fromEntries(
    Object.entries(AKSARA_CARAKAN).map(([k, v]) => [v, k])
);

const SANDANGAN_TO_LATIN = {
    'ꦶ': 'i',
    'ꦸ': 'u',
    'ꦺ': 'e',
    'ꦼ': 'ê',
    'ꦴ': '' // tarung (part of o)
};

const SWARA_TO_LATIN = Object.fromEntries(
    Object.entries(AKSARA_SWARA).map(([k, v]) => [v, k])
);

const ANGKA_TO_LATIN = Object.fromEntries(
    Object.entries(ANGKA_JAWA).map(([k, v]) => [v, k])
);

const PADA_TO_LATIN = Object.fromEntries(
    Object.entries(PADA).map(([k, v]) => [v, k])
);

// ==========================================
// Latin to Aksara Jawa Translation
// ==========================================

function latinToJawa(text) {
    if (!text || text.trim() === '') return '';
    
    text = text.toLowerCase().trim();
    let result = '';
    let i = 0;
    
    while (i < text.length) {
        // Skip spaces - just add space to result
        if (text[i] === ' ') {
            result += ' ';
            i++;
            continue;
        }
        
        // Handle punctuation
        if (PADA[text[i]]) {
            result += PADA[text[i]];
            i++;
            continue;
        }
        
        // Handle numbers
        if (/\d/.test(text[i])) {
            result += ANGKA_JAWA[text[i]] || text[i];
            i++;
            continue;
        }
        
        // Try to match consonant clusters (3 chars first, then 2, then 1)
        let matched = false;
        
        // Check for 3-char consonants (nya, dha, tha, nga)
        if (i + 2 < text.length) {
            const three = text.substring(i, i + 3);
            if (AKSARA_CARAKAN[three]) {
                result += processConsonant(three, text, i + 3);
                i += 3;
                // Check for following vowel
                const vowelResult = processVowel(text, i);
                result = result.slice(0, -AKSARA_CARAKAN[three].length) + vowelResult.aksara;
                i = vowelResult.nextIndex;
                matched = true;
                continue;
            }
        }
        
        // Check for 2-char consonants (ha, na, ca, etc.)
        if (!matched && i + 1 < text.length) {
            const two = text.substring(i, i + 2);
            if (AKSARA_CARAKAN[two]) {
                const vowelResult = processVowelAfterConsonant(two, text, i + 2);
                result += vowelResult.aksara;
                i = vowelResult.nextIndex;
                matched = true;
                continue;
            }
        }
        
        // Check for single consonants that are part of digraphs
        if (!matched) {
            const singleMatch = matchSingleConsonant(text, i);
            if (singleMatch) {
                const vowelResult = processVowelAfterConsonant(singleMatch.consonant, text, singleMatch.nextIndex);
                result += vowelResult.aksara;
                i = vowelResult.nextIndex;
                matched = true;
                continue;
            }
        }
        
        // Handle standalone vowels (aksara swara) at word start
        if (!matched && isVowel(text[i])) {
            const vowel = text[i];
            if (AKSARA_SWARA[vowel]) {
                result += AKSARA_SWARA[vowel];
                i++;
                matched = true;
                continue;
            }
        }
        
        // If nothing matched, just add the character
        if (!matched) {
            result += text[i];
            i++;
        }
    }
    
    return result;
}

function matchSingleConsonant(text, index) {
    // Map single consonants to their digraph form
    const singleToDigraph = {
        'h': 'ha', 'n': 'na', 'c': 'ca', 'r': 'ra', 'k': 'ka',
        'd': 'da', 't': 'ta', 's': 'sa', 'w': 'wa', 'l': 'la',
        'p': 'pa', 'j': 'ja', 'y': 'ya', 'm': 'ma', 'g': 'ga', 'b': 'ba'
    };
    
    const char = text[index];
    
    // Check if next char would form a special digraph
    if (index + 1 < text.length) {
        const nextChar = text[index + 1];
        
        // Special cases: dh, th, ng, ny
        if (char === 'd' && nextChar === 'h') return null; // Let 'dha' handle it
        if (char === 't' && nextChar === 'h') return null; // Let 'tha' handle it
        if (char === 'n' && nextChar === 'g') return null; // Let 'nga' handle it
        if (char === 'n' && nextChar === 'y') return null; // Let 'nya' handle it
    }
    
    if (singleToDigraph[char]) {
        return {
            consonant: singleToDigraph[char],
            nextIndex: index + 1
        };
    }
    
    return null;
}

function isVowel(char) {
    return ['a', 'i', 'u', 'e', 'è', 'é', 'ê', 'o', 'ò', 'ó'].includes(char);
}

function processConsonant(consonant, text, nextIndex) {
    return AKSARA_CARAKAN[consonant] || '';
}

function processVowelAfterConsonant(consonant, text, index) {
    let aksara = AKSARA_CARAKAN[consonant];
    let nextIndex = index;
    
    if (!aksara) {
        return { aksara: '', nextIndex: index };
    }
    
    // Check for vowel modifier
    if (index < text.length) {
        const char = text[index];
        
        // If it's a vowel other than 'a' (since 'a' is inherent)
        if (char === 'i') {
            aksara += SANDANGAN['i'];
            nextIndex++;
        } else if (char === 'u') {
            aksara += SANDANGAN['u'];
            nextIndex++;
        } else if (char === 'e' || char === 'é' || char === 'è') {
            aksara += SANDANGAN['e'];
            nextIndex++;
        } else if (char === 'ê') {
            aksara += SANDANGAN['ê'];
            nextIndex++;
        } else if (char === 'o' || char === 'ó' || char === 'ò') {
            aksara += SANDANGAN['o'];
            nextIndex++;
        } else if (char === 'a') {
            // 'a' is inherent, just skip it
            nextIndex++;
        }
        // If followed by consonant (no vowel), might need pangkon
        // But in standard Javanese, we use pasangan instead
    }
    
    return { aksara, nextIndex };
}

function processVowel(text, index) {
    let aksara = '';
    let nextIndex = index;
    
    if (index < text.length && isVowel(text[index])) {
        const vowel = text[index];
        aksara = SANDANGAN[vowel] || '';
        nextIndex++;
    }
    
    return { aksara, nextIndex };
}

// ==========================================
// Aksara Jawa to Latin Translation
// ==========================================

function jawaToLatin(text) {
    if (!text || text.trim() === '') return '';
    
    let result = '';
    let i = 0;
    
    while (i < text.length) {
        const char = text[i];
        
        // Check for space
        if (char === ' ') {
            result += ' ';
            i++;
            continue;
        }
        
        // Check for pada (punctuation)
        if (PADA_TO_LATIN[char]) {
            result += PADA_TO_LATIN[char];
            i++;
            continue;
        }
        
        // Check for numbers
        if (ANGKA_TO_LATIN[char]) {
            result += ANGKA_TO_LATIN[char];
            i++;
            continue;
        }
        
        // Check for aksara swara (independent vowels)
        if (SWARA_TO_LATIN[char]) {
            result += SWARA_TO_LATIN[char];
            i++;
            continue;
        }
        
        // Check for basic aksara
        if (CARAKAN_TO_LATIN[char]) {
            result += CARAKAN_TO_LATIN[char];
            i++;
            
            // Check for sandangan after aksara
            while (i < text.length) {
                const nextChar = text[i];
                
                // Check for pangkon (vowel killer)
                if (nextChar === PANGKON) {
                    // Remove the inherent 'a'
                    result = result.slice(0, -1); // Remove 'a' from 'ha'
                    i++;
                    break;
                }
                
                // Check for sandangan
                if (SANDANGAN_TO_LATIN[nextChar]) {
                    result = result.slice(0, -1); // Remove inherent 'a'
                    result += SANDANGAN_TO_LATIN[nextChar];
                    i++;
                    
                    // Check for tarung (part of 'o' sound)
                    if (nextChar === 'ꦺ' && i < text.length && text[i] === 'ꦴ') {
                        result = result.slice(0, -1); // Remove 'e'
                        result += 'o';
                        i++;
                    }
                    continue;
                }
                
                break;
            }
            continue;
        }
        
        // Check for pangkon alone
        if (char === PANGKON) {
            i++;
            continue;
        }
        
        // Check for tarung alone
        if (char === 'ꦴ') {
            i++;
            continue;
        }
        
        // Unknown character, just add it
        result += char;
        i++;
    }
    
    return result;
}

// ==========================================
// DOM Elements and Event Listeners
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const charCount = document.getElementById('charCount');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const themeToggle = document.getElementById('themeToggle');
    const keyboardToggle = document.getElementById('keyboardToggle');
    const virtualKeyboard = document.getElementById('virtualKeyboard');
    const closeKeyboard = document.getElementById('closeKeyboard');
    const inputLabel = document.getElementById('inputLabel');
    const outputLabel = document.getElementById('outputLabel');
    const directionBtns = document.querySelectorAll('.direction-btn');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    let currentDirection = 'latin-to-jawa';
    let translationHistory = JSON.parse(localStorage.getItem('aksaraHistory')) || [];
    
    // Initialize theme
    const savedTheme = localStorage.getItem('aksaraTheme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Initialize history display
    renderHistory();
    
    // Translation on input
    inputText.addEventListener('input', () => {
        const text = inputText.value;
        charCount.textContent = text.length;
        
        if (text.trim() === '') {
            outputText.innerHTML = '<span class="placeholder-text">Hasil terjemahan akan muncul di sini...</span>';
            return;
        }
        
        let result;
        if (currentDirection === 'latin-to-jawa') {
            result = latinToJawa(text);
        } else {
            result = jawaToLatin(text);
        }
        
        outputText.textContent = result;
    });
    
    // Direction toggle
    directionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            directionBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDirection = btn.dataset.direction;
            
            // Update labels
            if (currentDirection === 'latin-to-jawa') {
                inputLabel.textContent = 'Ketik Latin';
                outputLabel.textContent = 'Hasil Aksara Jawa';
            } else {
                inputLabel.textContent = 'Ketik Aksara Jawa';
                outputLabel.textContent = 'Hasil Latin';
            }
            
            // Re-translate
            inputText.dispatchEvent(new Event('input'));
        });
    });
    
    // Copy button
    copyBtn.addEventListener('click', () => {
        const text = outputText.textContent;
        if (text && !text.includes('Hasil terjemahan')) {
            navigator.clipboard.writeText(text).then(() => {
                showToast('Berhasil disalin!');
                
                // Save to history
                saveToHistory(inputText.value, text);
            });
        }
    });
    
    // Clear button
    clearBtn.addEventListener('click', () => {
        inputText.value = '';
        charCount.textContent = '0';
        outputText.innerHTML = '<span class="placeholder-text">Hasil terjemahan akan muncul di sini...</span>';
        inputText.focus();
    });
    
    // Download button
    downloadBtn.addEventListener('click', () => {
        const text = outputText.textContent;
        if (text && !text.includes('Hasil terjemahan')) {
            downloadAsImage(text);
        }
    });
    
    // Theme toggle
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('aksaraTheme', newTheme);
    });
    
    // Virtual keyboard toggle
    keyboardToggle.addEventListener('click', () => {
        virtualKeyboard.classList.toggle('hidden');
    });
    
    closeKeyboard.addEventListener('click', () => {
        virtualKeyboard.classList.add('hidden');
    });
    
    // Virtual keyboard keys
    document.querySelectorAll('.key').forEach(key => {
        key.addEventListener('click', () => {
            const char = key.dataset.char;
            inputText.value += char;
            inputText.dispatchEvent(new Event('input'));
            inputText.focus();
        });
    });
    
    // History functions
    function saveToHistory(input, output) {
        if (!input.trim() || !output.trim()) return;
        
        // Avoid duplicates
        const exists = translationHistory.some(item => item.input === input);
        if (exists) return;
        
        translationHistory.unshift({ input, output, time: Date.now() });
        
        // Keep only last 10 items
        if (translationHistory.length > 10) {
            translationHistory.pop();
        }
        
        localStorage.setItem('aksaraHistory', JSON.stringify(translationHistory));
        renderHistory();
    }
    
    function renderHistory() {
        if (translationHistory.length === 0) {
            historyList.innerHTML = '<p class="empty-history">Belum ada riwayat terjemahan.</p>';
            clearHistoryBtn.classList.add('hidden');
            return;
        }
        
        clearHistoryBtn.classList.remove('hidden');
        historyList.innerHTML = translationHistory.map((item, index) => `
            <div class="history-item">
                <div class="history-content">
                    <div class="history-input">${escapeHtml(item.input)}</div>
                    <div class="history-output">${escapeHtml(item.output)}</div>
                </div>
                <button class="history-use-btn" data-index="${index}">Gunakan</button>
            </div>
        `).join('');
        
        // Add click handlers for use buttons
        document.querySelectorAll('.history-use-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                const item = translationHistory[index];
                inputText.value = item.input;
                inputText.dispatchEvent(new Event('input'));
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }
    
    clearHistoryBtn.addEventListener('click', () => {
        translationHistory = [];
        localStorage.removeItem('aksaraHistory');
        renderHistory();
        showToast('Riwayat dihapus');
    });
    
    // Toast notification
    function showToast(message) {
        toastMessage.textContent = message;
        toast.classList.remove('hidden');
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.classList.add('hidden'), 300);
        }, 2000);
    }
    
    // Download as image
    function downloadAsImage(text) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = 800;
        canvas.height = 400;
        
        // Background
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Border
        ctx.strokeStyle = isDark ? '#334155' : '#e2e8f0';
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        
        // Title
        ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
        ctx.font = '16px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Aksara Jawa Translator', canvas.width / 2, 50);
        
        // Main text
        ctx.fillStyle = isDark ? '#f1f5f9' : '#0f172a';
        ctx.font = '48px "Noto Sans Javanese", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Word wrap if needed
        const maxWidth = canvas.width - 80;
        const words = text.split('');
        let line = '';
        let y = canvas.height / 2;
        
        if (ctx.measureText(text).width <= maxWidth) {
            ctx.fillText(text, canvas.width / 2, y);
        } else {
            ctx.font = '32px "Noto Sans Javanese", serif';
            ctx.fillText(text.substring(0, 30) + '...', canvas.width / 2, y);
        }
        
        // Footer
        ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText('aksarajawa.github.io', canvas.width / 2, canvas.height - 30);
        
        // Download
        const link = document.createElement('a');
        link.download = 'aksara-jawa-' + Date.now() + '.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        showToast('Gambar berhasil diunduh!');
    }
    
    // Escape HTML helper
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
