import { Router } from 'express';
import { statisticsService, caseService } from '../services';

const router = Router();

router.get('/summary', (req, res) => {
  const summary = statisticsService.getSummary();
  res.json({ success: true, data: summary });
});

router.get('/monthly', (req, res) => {
  const stats = statisticsService.getMonthlyStats();
  res.json({ success: true, data: stats });
});

router.get('/overdue', (req, res) => {
  const cases = statisticsService.getOverdueCases();
  res.json({ success: true, data: cases });
});

router.get('/search', (req, res) => {
  const keyword = req.query.keyword as string;
  if (!keyword) {
    return res.status(400).json({ success: false, message: '请输入关键词' });
  }
  const cases = caseService.searchCases(keyword);
  res.json({ success: true, data: cases });
});

export default router;
