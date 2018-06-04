const _ = require('./lodash')

// 0〜100のランダム値を取得する
const getRandom = () => Math.floor(Math.random() * 101)

// 1回のトーナメント参加者のオブジェクト配列を生成する
const generateContestants = roundTimes => _.range(2 ** roundTimes).map(() => {
  return {
    talent: getRandom(),
    effort: getRandom(),
    luck: getRandom()
  }
})

// 対象contestantの実力得点を算出する
const getMeritScore = contestant => contestant.talent + contestant.effort

// 対象contestantの最終得点を算出する(能力49％、努力、49％、運2％)
const getFinalScore = contestant => (49 * contestant.talent + 49 * contestant.effort + 2 * contestant.luck) / 100

// 1つのトーナメントの勝者を決定するために各ラウンドを実施する。ラウンドごとに再帰的に実行する
const tournament = (contestants, isProbabilisticBattle) => {
  const winners = []
  for (let i = 0; i < contestants.length; i = i + 2) {
    const a = contestants[i]
    const b = contestants[i + 1]
    if (isProbabilisticBattle) {
      const aScore = getFinalScore(a)
      const bScore = getFinalScore(b)
      const aWinRatio = aScore / (aScore + bScore)
      const doesAWin = aWinRatio >= Math.random()
      winners.push(doesAWin ? a : b)
    } else {
      winners.push(getFinalScore(a) > getFinalScore(b) ? a : b)
    }
  }
  if (winners.length === 1) {
    return winners[0]
  }
  return tournament(winners, isProbabilisticBattle)
}

// 1回の実験のハンドリングをする
const experiment = (roundTimes, isProbabilisticBattle) => {
  const contestants = generateContestants(roundTimes)
  const sortedByMerit = _.reverse(_.sortBy(contestants, [getMeritScore]))
  const highestMeritScore = getMeritScore(sortedByMerit[0])
  const winner = tournament(contestants, isProbabilisticBattle)
  return {
    winner: winner,
    doesHighestMeritWin: getMeritScore(winner) === highestMeritScore,
    highestMeritClub: contestants.filter(c => getMeritScore(c) === highestMeritScore)
  }
}

// 1回の実験の結果を出力する
const showExperimentResult = (winner, doesHighestMeritWin, highestMeritClub) => {
  console.log('このトーナメントにおいて能力スコア(能力値＋努力値)が最も高い人の数: ' + highestMeritClub.length)
  if (!doesHighestMeritWin) {
    console.log('☆☆☆☆能力スコア(能力値＋努力値)が最高ではないのに勝利☆☆☆')
  }
  console.log('winner:')
  console.log(winner)
  console.log('\n')
}

// 全ての実験についてまとめた最終結果を出力する
const showFinalResult = experimentResults => {
  // 実力(talent + effort)が最も強い人が勝つ回数
  const highestMeritWinTimes = experimentResults.filter(r => r.doesHighestMeritWin).length
  // トーナメント勝者のluck値の合計。後で平均の算出に使用する
  const winnerLuckSum = _.sumBy(experimentResults, r => r.winner.luck)
  // トーナメント勝者の実力(talent + effort)の合計。後で平均の算出に使用する
  const winnerMeritSum = _.sumBy(experimentResults, r => getMeritScore(r.winner))

  console.log('能力スコア(能力値＋努力値)が最も高い人がトーナメントで優勝する確率: ' + Math.floor((highestMeritWinTimes / experimentResults.length) * 100) + '%')
  console.log('トーナメント勝者の運の平均値: ' + Math.floor((winnerLuckSum / experimentResults.length) * 100) / 100)
  console.log('トーナメント勝者の能力スコア(能力値＋努力値)の平均値: ' + Math.floor((winnerMeritSum / experimentResults.length) * 100) / 100)
}

// 指定した回数だけ実験を行う
const main = (experimentTimes, roundTimes, isProbabilisticBattle) => {
  const experimentResults = _.range(experimentTimes).map(() => {
    const result = experiment(roundTimes, isProbabilisticBattle)
    showExperimentResult(result.winner, result.doesHighestMeritWin, result.highestMeritClub)
    return result
  })

  showFinalResult(experimentResults)
}

/**
 * メイン関数
 * @param experimentTimes - 実験回数
 * @param roundTimes - トーナメントの回戦数。17回戦で131,072人の参加者になる≒10万人
 * @param isProbabilisticBattle - 個々人の総合力により重み付けられた確率で勝敗が決まるか(true)、個々人の総合力のみに基づいて勝敗が決まるか(false)
 */
main(100, 17, false)
