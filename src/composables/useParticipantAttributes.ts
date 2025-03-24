import { useEnsureParticipant, useMaybeParticipantContext } from '@/context';
import { participantAttributesObserver } from '@livekit/components-core';
import { useSubscription } from '@vueuse/rxjs';
import type { Participant } from 'livekit-client';
import type { Observable } from 'rxjs';
import { computed, ref, shallowRef, type Ref } from 'vue';

export type UseParticipantAttributesOptions = {
  participant?: Participant;
};

export type AttributeObservable = Observable<{
  changed: Readonly<Record<string, string>>;
  attributes: Readonly<Record<string, string>>;
}>;

export type UseParticipantAttribute = {
  attribute: Ref<string | undefined>;
};

export type UseParticipantAttributes = {
  attributes: Ref<Readonly<Record<string, string>> | undefined>;
};

export function useParticipantAttribute(
  attributeKey: string,
  options: UseParticipantAttributesOptions = {},
): UseParticipantAttribute {
  const p = useEnsureParticipant(options.participant);
  const attribute = ref(p.value?.attributes[attributeKey]);

  useSubscription(
    participantAttributesObserver(p.value).subscribe((attr) => {
      if (attr.changed[attributeKey] !== undefined) {
        attribute.value = attr.attributes[attributeKey];
      }
    }),
  );

  return { attribute };
}

export function useParticipantAttributes(
  props: UseParticipantAttributesOptions = {},
): UseParticipantAttributes {
  const participantContext = useMaybeParticipantContext();
  const p = shallowRef(props.participant) ?? participantContext?.value;

  const attributes = ref(p.value?.attributes);

  const attributeObserver = computed<AttributeObservable>(
    () =>
      (p.value
        ? participantAttributesObserver(p.value)
        : participantAttributesObserver(p.value)) as unknown as AttributeObservable,
  );

  useSubscription(
    attributeObserver.value.subscribe((attr) => {
      attributes.value = attr.attributes;
    }),
  );

  return { attributes };
}
