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
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="flex-1 justify-between font-normal h-14 text-lg px-4"
            disabled={loading}
          >
            {selectedContact ? (
              <span className="truncate">
                {selectedContact.name}
                {selectedContact.phone && (
                  <span className="text-muted-foreground ml-2">
                    ({selectedContact.phone})
                  </span>
                )}
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Tìm theo tên hoặc SĐT..." className="h-12 text-base" />
            <CommandList className="max-h-[300px]">
              <CommandEmpty className="py-4 text-base">Không tìm thấy đối tượng.</CommandEmpty>
              <CommandGroup>
                {contacts.map((contact) => (
                  <CommandItem
                    key={contact._id}
                    value={`${contact.name} ${contact.phone || ''}`}
                    onSelect={() => handleSelect(contact._id)}
                    className="py-3 px-3 text-base cursor-pointer"
                  >
                    <Check
                      className={cn(
                        'mr-3 h-5 w-5',
                        value === contact._id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="text-base font-medium">{contact.name}</span>
                      {contact.phone && (
                        <span className="text-sm text-muted-foreground">
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
          className="h-14 w-14 shrink-0"
          onClick={onCreateNew}
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
