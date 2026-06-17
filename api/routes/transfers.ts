import { Router } from 'express';
import { transferService } from '../services';

const router = Router();

router.get('/pending', (req, res) => {
  const transfers = transferService.getPendingTransfers();
  res.json({ success: true, data: transfers });
});

router.get('/case/:caseId', (req, res) => {
  const transfer = transferService.getTransferByCaseId(req.params.caseId);
  if (!transfer) {
    return res.status(404).json({ success: false, message: '移交记录不存在' });
  }
  res.json({ success: true, data: transfer });
});

router.post('/generate', (req, res) => {
  const { caseId } = req.body;
  const catalog = transferService.generateMaterialCatalog(caseId);
  res.json({ success: true, data: catalog });
});

router.post('/', (req, res) => {
  try {
    const { caseId, handler } = req.body;
    const transfer = transferService.createTransfer(caseId, handler);
    res.status(201).json({ success: true, data: transfer });
  } catch (error) {
    res.status(400).json({ success: false, message: error instanceof Error ? error.message : '创建失败' });
  }
});

router.put('/:id/send', (req, res) => {
  const transfer = transferService.sendTransfer(req.params.id);
  if (!transfer) {
    return res.status(404).json({ success: false, message: '移交记录不存在' });
  }
  res.json({ success: true, data: transfer });
});

export default router;
