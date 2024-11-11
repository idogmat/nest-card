export class MyStatistic {
  sumScore: number;
  avgScores: number;
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;
}


export const MyStatisticMapper = (statistic: any): MyStatistic => {
  const outputModel = new MyStatistic();
  outputModel.sumScore = statistic?.sumScore || 0;
  outputModel.avgScores = statistic?.avgScores || 0;
  outputModel.gamesCount = statistic?.gamesCount || 0;
  outputModel.winsCount = statistic?.winsCount || 0;
  outputModel.lossesCount = statistic?.lossesCount || 0;
  return outputModel;
};