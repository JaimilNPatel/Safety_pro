import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ClipboardCheck, Building2, FlaskConical, Settings, FileText } from 'lucide-react';
import { 
  type ChecklistItem, 
  groupChecklistByCategory, 
  getPriorityVariant 
} from '@/lib/checklistGenerator';

interface DynamicChecklistProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
  title?: string;
  description?: string;
}

export default function DynamicChecklist({ 
  items, 
  onChange, 
  title = "Safety Checklist",
  description = "Complete all applicable checklist items"
}: DynamicChecklistProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const groupedItems = groupChecklistByCategory(items);
  const categories = Object.keys(groupedItems);
  
  const checkedCount = items.filter(i => i.checked).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleItem = (itemId: string, checked: boolean) => {
    const updated = items.map(item =>
      item.id === itemId ? { ...item, checked } : item
    );
    onChange(updated);
  };

  const getSourceIcon = (sourceType: ChecklistItem['source_type']) => {
    switch (sourceType) {
      case 'site':
        return <Building2 className="h-3 w-3" />;
      case 'chemical':
        return <FlaskConical className="h-3 w-3" />;
      case 'equipment':
        return <Settings className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const getCategoryProgress = (category: string) => {
    const categoryItems = groupedItems[category];
    const checked = categoryItems.filter(i => i.checked).length;
    return { checked, total: categoryItems.length };
  };

  const getCriticalCount = (category: string) => {
    return groupedItems[category].filter(i => i.priority === 'critical' && !i.checked).length;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
        
        {/* Overall Progress */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Overall Progress</span>
            <span className="font-medium">{checkedCount} / {totalCount} items</span>
          </div>
          <Progress value={progress} />
        </div>

        {/* Priority Summary */}
        <div className="mt-3 flex gap-2 flex-wrap">
          <Badge variant="destructive" className="text-xs">
            {items.filter(i => i.priority === 'critical' && !i.checked).length} Critical
          </Badge>
          <Badge variant="default" className="text-xs">
            {items.filter(i => i.priority === 'high' && !i.checked).length} High
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {items.filter(i => i.priority === 'medium' && !i.checked).length} Medium
          </Badge>
          <Badge variant="outline" className="text-xs">
            {items.filter(i => i.priority === 'low' && !i.checked).length} Low
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {categories.map(category => {
          const isExpanded = expandedCategories.has(category);
          const { checked, total } = getCategoryProgress(category);
          const criticalCount = getCriticalCount(category);
          const allChecked = checked === total;

          return (
            <Collapsible
              key={category}
              open={isExpanded}
              onOpenChange={() => toggleCategory(category)}
            >
              <div className={`rounded-lg border ${allChecked ? 'border-success/50 bg-success/5' : ''}`}>
                <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    <span className="font-medium">{category}</span>
                    {criticalCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {criticalCount} critical
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {checked}/{total}
                    </span>
                    {allChecked && (
                      <Badge variant="secondary" className="bg-success text-success-foreground text-xs">
                        Complete
                      </Badge>
                    )}
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-t px-4 py-2 space-y-2">
                    {groupedItems[category].map(item => (
                      <label
                        key={item.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50 ${
                          item.checked ? 'bg-muted/30' : ''
                        }`}
                      >
                        <Checkbox
                          checked={item.checked}
                          onCheckedChange={(checked) => toggleItem(item.id, !!checked)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <span className={`text-sm ${item.checked ? 'text-muted-foreground line-through' : ''}`}>
                              {item.item}
                            </span>
                            <Badge 
                              variant={getPriorityVariant(item.priority)} 
                              className="text-xs shrink-0"
                            >
                              {item.priority}
                            </Badge>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            {getSourceIcon(item.source_type)}
                            <span>{item.source_reference}</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}

        {items.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            No checklist items generated. Add chemicals or equipment to generate relevant checks.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
