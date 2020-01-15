from django.db import models

# Create your models here.

class Session(models.Model):
    sessionID = models.TextField()
    plays = ArrayField(
        models.TimeField()
    )
    pauses = ArrayField(
        models.TimeField()
    )
    transcripts = ArrayField(

    )
    actor = models.TextField()
    signature = models.CharField(max_length=30, unique=True, blank=True)
    owner = models.ForeignKey('User', related_name='voicegen_set', on_delete=models.CASCADE)

    def save(self, *args, **kwargs):
        contents = self.prosody[1:-1].split(',')
        if self.prosody != '' and len(contents) != len(self.text):
            raise DRFValidationError('The length of prosody should be equal to that of text.')

        # Make the signature.
        if self.signature is "":
            self.signature = self.generate_signature()

        # Save this model.
        super(VoiceGeneration, self).save(*args, **kwargs)

    def generate_signature(self):
        """Random string generator."""
        base_string = str(self.owner)
        random_digits = ''.join(random.SystemRandom().choice(string.digits) for _ in range(5))
        if VoiceGeneration.objects.filter(signature=base_string+random_digits).exists():
            return self.generate_signature()
        return base_string + random_digits

    def __str__(self):
        return 'signature: ' + self.signature