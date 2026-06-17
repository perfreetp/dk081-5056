import { Router } from 'express';
import { acceptanceService } from '../services';

const router = Router();

router.get('/', (req, res) => {
  const acceptances = acceptanceService.getAcceptances();
  res.json({ success: true, data: acceptances });
});

router.get('/case/:caseId', (req, res) => {
  const acceptance = acceptanceService.getAcceptanceByCaseId(req.params.caseId);
  if (!acceptance) {
    return res.status(404).json({ success: false, message: '受理记录不存在' });
  }
  res.json({ success: true, data: acceptance });
});

router.post('/', (req, res) => {
  try {
    const acceptance = acceptanceService.createAcceptance(req.body);
    res.status(201).json({ success: true, data: acceptance });
  } catch (error) {
    res.status(400).json({ success: false, message: error instanceof Error ? error.message : '创建失败' });
  }
});

router.put('/:id/correction', (req, res) => {
  const { opinions } = req.body;
  const acceptance = acceptanceService.addCorrectionOpinion(req.params.id, opinions);
  if (!acceptance) {
    return res.status(404).json({ success: false, message: '受理记录不存在' });
  }
  res.json({ success: true, data: acceptance });
});

router.post('/:id/supplement', (req, res) => {
  const { opinionIds } = req.body;
  const acceptance = acceptanceService.confirmSupplement(req.params.id, opinionIds);
  if (!acceptance) {
    return res.status(404).json({ success: false, message: '受理记录不存在' });
  }
  res.json({ success: true, data: acceptance });
});

export default router;
