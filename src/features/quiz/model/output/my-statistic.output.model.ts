export class MyStatistic {
  sumScore: number;
  avgScores: number;
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;
  player: {
    id: string;
    login: string;
  };
}


export const MyStatisticMapper = (statistic: any): MyStatistic => {
  const outputModel = new MyStatistic();
  outputModel.sumScore = Number(statistic?.sumScore || 0);
  outputModel.avgScores = parseFloat(Number(statistic?.avgScores || 0).toFixed(2));
  outputModel.gamesCount = Number(statistic?.gamesCount || 0);
  outputModel.winsCount = Number(statistic?.winsCount || 0);
  outputModel.drawsCount = Number(statistic?.drawsCount || 0);
  outputModel.lossesCount = Number(statistic?.lossesCount || 0);
  if (statistic.player?.id) {
    outputModel.player = statistic.player;
  }
  return outputModel;
};