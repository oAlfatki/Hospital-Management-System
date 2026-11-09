import { Trash2 } from 'lucide-react';
import { Button } from './Button';
import { useLanguage } from '../../providers';
interface Props { onDelete: () => void; disabled?: boolean; label?: string; name: string; }
export function DeleteButton({ onDelete, disabled, label, name }: Props) {
  const { t } = useLanguage();
  return <Button variant="ghost" size="icon" aria-label={label || t('deleteAction')} title={t('deleteAction')}
    disabled={disabled} className="text-rose-500 shrink-0"
    onClick={() => { if (window.confirm(`${t('confirmDelete')}
${name}`)) onDelete(); }}>
    <Trash2 className="h-4 w-4" />
  </Button>;
}
