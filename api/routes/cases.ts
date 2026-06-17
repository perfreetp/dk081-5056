import { Router } from 'express';
import { caseService } from '../services';
import type {
  CaseInfo,
  Heir,
  Attachment,
  DisputeRecord,
  CaseQueryParams,
} from '../../shared';

const router = Router();

router.get('/', (req, res) => {
  const params: CaseQueryParams = {
    keyword: req.query.keyword as string,
    status: req.query.status as CaseQueryParams['status'],
    caseType: req.query.caseType as CaseQueryParams['caseType'],
    source: req.query.source as string,
    startDate: req.query.startDate as string,
    endDate: req.query.endDate as string,
    page: req.query.page ? parseInt(req.query.page as string) : undefined,
    pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : undefined,
  };

  const result = caseService.getCases(params);
  res.json({ success: true, data: result });
});

router.get('/:id', (req, res) => {
  const caseInfo = caseService.getCaseById(req.params.id);
  if (!caseInfo) {
    return res.status(404).json({ success: false, message: '案件不存在' });
  }
  res.json({ success: true, data: caseInfo });
});

router.post('/', (req, res) => {
  try {
    const body = req.body as Omit<CaseInfo, 'id' | 'createdAt' | 'updatedAt'>;
    const newCase = caseService.createCase(body);
    res.status(201).json({ success: true, data: newCase });
  } catch (error) {
    res.status(400).json({ success: false, message: error instanceof Error ? error.message : '创建失败' });
  }
});

router.put('/:id', (req, res) => {
  const updated = caseService.updateCase(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: '案件不存在' });
  }
  res.json({ success: true, data: updated });
});

router.get('/:id/duplicates', (req, res) => {
  const caseInfo = caseService.getCaseById(req.params.id);
  if (!caseInfo) {
    return res.status(404).json({ success: false, message: '案件不存在' });
  }
  const duplicates = caseService.findDuplicates(caseInfo.deceasedIdCard, req.params.id);
  res.json({ success: true, data: duplicates });
});

router.get('/:id/heirs', (req, res) => {
  const heirs = caseService.getHeirs(req.params.id);
  res.json({ success: true, data: heirs });
});

router.post('/:id/heirs', (req, res) => {
  const heir = caseService.addHeir({
    ...req.body,
    caseId: req.params.id,
  } as Omit<Heir, 'id'>);
  res.status(201).json({ success: true, data: heir });
});

router.put('/heirs/:id', (req, res) => {
  const updated = caseService.updateHeir(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: '继承人不存在' });
  }
  res.json({ success: true, data: updated });
});

router.delete('/heirs/:id', (req, res) => {
  const deleted = caseService.deleteHeir(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: '继承人不存在' });
  }
  res.json({ success: true });
});

router.get('/:id/attachments', (req, res) => {
  const attachments = caseService.getAttachments(req.params.id);
  res.json({ success: true, data: attachments });
});

router.post('/:id/attachments', (req, res) => {
  const attachment = caseService.addAttachment({
    ...req.body,
    caseId: req.params.id,
  } as Omit<Attachment, 'id'>);
  res.status(201).json({ success: true, data: attachment });
});

router.get('/:id/disputes', (req, res) => {
  const disputes = caseService.getDisputes(req.params.id);
  res.json({ success: true, data: disputes });
});

router.post('/:id/disputes', (req, res) => {
  const dispute = caseService.addDispute({
    ...req.body,
    caseId: req.params.id,
  } as Omit<DisputeRecord, 'id' | 'createdAt' | 'updatedAt'>);
  res.status(201).json({ success: true, data: dispute });
});

router.put('/disputes/:id', (req, res) => {
  const updated = caseService.updateDispute(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: '争议记录不存在' });
  }
  res.json({ success: true, data: updated });
});

router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  const updated = caseService.updateCaseStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ success: false, message: '案件不存在' });
  }
  res.json({ success: true, data: updated });
});

router.post('/:id/merge', (req, res) => {
  const { duplicateCaseIds } = req.body as { duplicateCaseIds: string[] };
  if (!Array.isArray(duplicateCaseIds) || duplicateCaseIds.length === 0) {
    return res.status(400).json({ success: false, message: '请选择需要归并的重复案件' });
  }
  const result = caseService.mergeCases(req.params.id, duplicateCaseIds);
  if (!result.mainCase) {
    return res.status(404).json({ success: false, message: '主案件不存在' });
  }
  res.json({ success: true, data: result });
});

export default router;
