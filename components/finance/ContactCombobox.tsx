'use client';

import { useState, useEffect, useCallback } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

interface Contact {
  _id: string;
  name: string;
  phone?: string;
}

interface ContactComboboxProps {
  value?: string;
  onChange: (value: string) => void;
  onCreateNew?: () => void;
  placeholder?: string;
  contacts?: Contact[];
  refreshContacts?: () => void;
}

export function ContactCombobox({
  value,
  onChange,
  onCreateNew,
  placeholder = 'Chọn đối tượng...',
  contacts: externalContacts,
  refreshContacts,
}: ContactComboboxProps) {
  const [open, setOpen] = useState(false);
  const [internalContacts, setInternalContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);

  // Use external contacts if provided, otherwise fetch internally
  const contacts = externalContacts || internalContacts;

  const fetchContacts = useCallback(async () => {
    if (externalContacts) return; // Skip if using external contacts

    setLoading(true);
    try {
      const res = await fetch('/api/contacts?status=active');
      if (res.ok) {
        const data = await res.json();
        setInternalContacts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  }, [externalContacts]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const selectedContact = contacts.find(c => c._id === value);

  const handleSelect = (contactId: string) => {
    onChange(contactId === value ? '' : contactId);
    setOpen(false);
  };

  return (
    <div className="flex  w-100 gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
            disabled={loading}
          >
            {selectedContact ? (
              <span className="truncate">
                {selectedContact.name}
                {selectedContact.phone && (
                  <span className="text-muted-foreground ml-1">
                    ({selectedContact.phone})
                  </span>
                )}
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-50 p-0" align="start">
          <Command>
            <CommandInput placeholder="Tìm theo tên hoặc SĐT..." />
            <CommandList>
              <CommandEmpty>Không tìm thấy đối tượng.</CommandEmpty>
              <CommandGroup>
                {contacts.map((contact) => (
                  <CommandItem
                    key={contact._id}
                    value={`${contact.name} ${contact.phone || ''}`}
                    onSelect={() => handleSelect(contact._id)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === contact._id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{contact.name}</span>
                      {contact.phone && (
                        <span className="text-xs text-muted-foreground">
                          {contact.phone}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {onCreateNew && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onCreateNew}
          title="Thêm mới đối tượng"
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
