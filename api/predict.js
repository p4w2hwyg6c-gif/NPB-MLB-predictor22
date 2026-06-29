module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { playerName, year } = req.body;
  if (!playerName) return res.status(400).json({ error: '選手名が必要です' });

  const yearContext = year
    ? `「${year}年シーズン終了時点」の成績・年齢で分析。${year}年のシーズン成績とキャリア累計・傾向を考慮すること。`
    : `直近の成績・現在の年齢で分析すること。`;

  const prompt = `あなたはNPB選手のMLB移籍契約を予測する専門アナリストです。

【重要ルール】
1. 「${playerName}」がNPB（日本プロ野球）出身かどうかを必ず確認すること。
2. MLB球団に所属していた、またはMLBでキャリアを積んだ選手（例：MLB→MLB移籍）は対象外。必ず found: false を返すこと。
3. NPB出身でMLBに移籍した選手、またはNPBに現在所属する選手のみ対象。
4. 類似事例は必ずNPB→MLB移籍のみを挙げること。MLB内の移籍事例は絶対に含めないこと。
5. 契約金はすべて2025年現在の市場価値・インフレ調整済みの金額で表示すること。過去の契約（例：田中将大2014年$155M）はMLB市場の成長率と物価上昇を考慮して2025年相当額に換算すること。

「${playerName}」について${yearContext}
投手か野手かを自動判定し、以下のJSONのみで返してください。マークダウン・コードブロック不可。

{
  "found": true,
  "name": "正式名",
  "team": "所属球団",
  "age": 年齢(数値),
  "type": "投手" or "野手",
  "position": "ポジション（日本語）",
  "season_year": "${year || '直近'}",

  "stats_main": {
    "wins": "勝利数(投手のみ、野手はnull)",
    "era": "ERA(投手のみ、野手はnull)",
    "games": "登板数(投手のみ、野手はnull)",
    "gs": "先発登板(投手のみ、野手はnull)",
    "ip": "投球回(投手のみ、野手はnull)",
    "er": "自責点(投手のみ、野手はnull)",
    "whip": "WHIP(投手のみ、野手はnull)",
    "goao": "GO/AO(投手のみ、野手はnull)",
    "kper9": "K/9(投手のみ、野手はnull)",
    "war": "rWAR(投手のみ、野手はnull)",
    "bb": "BB(投手のみ、野手はnull)",
    "fip": "FIP(投手のみ、野手はnull)",
    "so": "奪三振数(投手のみ、野手はnull)",
    "kbb": "K/BB(投手のみ、野手はnull)",
    "avg": "打率(野手のみ、投手はnull)",
    "obp": "出塁率(野手のみ、投手はnull)",
    "slg": "長打率(野手のみ、投手はnull)",
    "ops": "OPS(野手のみ、投手はnull)",
    "hr": "HR(野手のみ、投手はnull)",
    "rbi": "打点(野手のみ、投手はnull)",
    "sb": "盗塁(野手のみ、投手はnull)",
    "r": "得点(野手のみ、投手はnull)",
    "h": "安打(野手のみ、投手はnull)",
    "doubles": "二塁打(野手のみ、投手はnull)",
    "triples": "三塁打(野手のみ、投手はnull)",
    "bb_b": "BB(野手のみ、投手はnull)",
    "k_b": "K(野手のみ、投手はnull)",
    "babip": "BABIP(野手のみ、投手はnull)"
  },

  "stats_adv": {
    "xera": "xERA推定(投手のみ)",
    "xba_p": "xBA推定(投手のみ)",
    "fb_velo": "Fastball Velo mph(投手のみ)",
    "chase_p": "Chase%(投手のみ)",
    "whiff_p": "Whiff%(投手のみ)",
    "kpct_p": "K%(投手のみ)",
    "bbpct_p": "BB%(投手のみ)",
    "barrel_p": "被Barrel%(投手のみ)",
    "hardhit_p": "被HardHit%(投手のみ)",
    "gb": "GB%(投手のみ)",
    "extension": "Extension ft(投手のみ)",
    "whip_adv": "WHIP MLB水準評価(投手のみ)",
    "war_adv_p": "WAR MLB換算(投手のみ)",
    "fip_adv": "FIP MLB水準評価(投手のみ)",
    "kbb_adv": "K/BB MLB水準評価(投手のみ)",
    "batting_rv": "Batting Run Value(野手のみ)",
    "baserunning_rv": "Baserunning Run Value(野手のみ)",
    "fielding_rv": "Fielding Run Value(野手のみ)",
    "xwoba": "xwOBA推定(野手のみ)",
    "xba_b": "xBA推定(野手のみ)",
    "xslg": "xSLG推定(野手のみ)",
    "exit_velo": "Avg Exit Velo mph(野手のみ)",
    "barrel_b": "Barrel%(野手のみ)",
    "hardhit_b": "HardHit%(野手のみ)",
    "bat_speed": "Bat Speed mph(野手のみ)",
    "squared_up": "Squared-Up%(野手のみ)",
    "chase_b": "Chase%(野手のみ)",
    "whiff_b": "Whiff%(野手のみ)",
    "kpct_b": "K%(野手のみ)",
    "bbpct_b": "BB%(野手のみ)",
    "oaa": "OAA(野手のみ)",
    "arm_value": "Arm Value(野手のみ)",
    "arm_strength": "Arm Strength mph(野手のみ)",
    "sprint_speed": "Sprint Speed ft/s(野手のみ)",
    "war_b": "WAR(野手のみ)",
    "war_note": "WAR MLB換算評価(野手のみ)"
  },

  "scores": {
    "score1": 0〜100,
    "score2": 0〜100,
    "score3": 0〜100,
    "score4": 0〜100,
    "score5": 0〜100,
    "score6": 0〜100,
    "score7": 0〜100,
    "score8": 0〜100,
    "score9": 0〜100,
    "score10": 0〜100,
    "score11": 0〜100,
    "score12": 0〜100,
    "labels": ["ラベル1","ラベル2","ラベル3","ラベル4","ラベル5","ラベル6","ラベル7","ラベル8","ラベル9","ラベル10","ラベル11","ラベル12"],
    "descs": ["説明1","説明2","説明3","説明4","説明5","説明6","説明7","説明8","説明9","説明10","説明11","説明12"]
  },

  "predicted_years": 整数,
  "predicted_total_m": 整数（2025年相当額・百万ドル）,
  "aav_m": 整数（2025年相当額・年平均百万ドル）,
  "confidence": "高" or "中" or "低",

  "similar_cases": [
    {
      "name": "NPB出身選手名のみ",
      "year": 実際の移籍年(整数),
      "years": 契約年数(整数),
      "total_m": 2025年相当額に換算した百万ドル(整数),
      "original_m": 当時の実際の契約額百万ドル(整数),
      "note": "類似ポイントと換算率の説明"
    }
  ],

  "comment": "MLB評価と予測根拠を3文（日本語）。2025年市場基準で説明し、主要アドバンスト指標の観点を含めること。"
}

【NPB→MLB移籍事例と2025年相当額の参考】
以下は実際の契約額と2025年換算額の例（MLB市場は年約8〜10%成長）：
- 山本由伸（2023年）: $325M/12年 → 2025年換算 約$350M
- 今永昇太（2023年）: $53M/4年 → 2025年換算 約$57M
- 菊池雄星（2022年）: $56M/3年 → 2025年換算 約$63M
- 吉田正尚（2022年）: $90M/5年 → 2025年換算 約$100M
- ダルビッシュ有（2011年）: $56M/6年 → 2025年換算 約$95M
- 田中将大（2013年）: $155M/7年 → 2025年換算 約$250M
- 前田健太（2015年）: $25M/6年 → 2025年換算 約$38M
- 大谷翔平（2023年）: $700M/10年 → 2025年換算 約$750M
- 筒香嘉智（2019年）: $9M/2年 → 2025年換算 約$12M
- 秋山翔吾（2019年）: $6.5M/2年 → 2025年換算 約$9M
- 青木宣親（2011年）: $3M/1年 → 2025年換算 約$5M
- 福留孝介（2007年）: $48M/4年 → 2025年換算 約$90M

類似事例は必ずNPB出身選手のみ。MLB内移籍（例：トラウト、Judge等）は絶対に含めないこと。
Statcast系指標はNPB公式集計外のため合理的に推定すること。
選手がNPB出身でない・存在しない場合は found: false のみ返すこと。`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`);

    const data = await response.json();
    const raw = data.content.map(b => b.text || '').join('');
    const clean = raw.replace(/```json|```/g, '').trim();
    return res.status(200).json(JSON.parse(clean));
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'サーバーエラーが発生しました', detail: error.message });
  }
};
