"""
PyTorch ImageFolder-style dataloader for Zenodo ET ASD Severity eye images.

Structure: datasets/eyes/{low,mild,medium,high}/images
Labels mapped to risk score: low=0.2, mild=0.4, medium=0.65, high=0.9
Transforms: Resize 224, Normalize (ImageNet).
"""

from __future__ import annotations

from pathlib import Path
from typing import Optional

import torch
from torch.utils.data import DataLoader, Dataset
from torchvision import transforms

# Default root: datasets/eyes (sibling to this file)
DEFAULT_ROOT = Path(__file__).resolve().parent

# Severity -> risk score (0–1)
SEVERITY_TO_RISK = {
    "low": 0.2,
    "mild": 0.4,
    "medium": 0.65,
    "high": 0.9,
}

# Transforms: Resize 224, Normalize (ImageNet)
DEFAULT_TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])

DEFAULT_TRANSFORM_TRAIN = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(10),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])


class ETSeverityDataset(Dataset):
    """
    Eye-tracking severity dataset: root/{low,mild,medium,high}/images/*.jpg
    Returns (image_tensor, risk_score) with risk in [0.2, 0.9].
    """

    def __init__(
        self,
        root: Optional[Path | str] = None,
        transform=None,
        severities=None,
    ):
        from PIL import Image

        self.Image = Image
        self.root = Path(root or DEFAULT_ROOT)
        self.transform = transform or DEFAULT_TRANSFORM
        severities = severities or ["low", "mild", "medium", "high"]
        self.samples = []
        self.class_to_idx = {s: i for i, s in enumerate(severities)}
        self.class_to_risk = {
            i: SEVERITY_TO_RISK.get(s, 0.5) for i, s in enumerate(severities)
        }
        for sev in severities:
            img_dir = self.root / sev / "images"
            if not img_dir.exists():
                img_dir = self.root / sev
            if img_dir.exists():
                for f in sorted(img_dir.iterdir()):
                    if f.suffix.lower() in (".jpg", ".jpeg", ".png"):
                        self.samples.append((str(f), self.class_to_idx[sev]))

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, i: int) -> tuple[torch.Tensor, float]:
        path, target = self.samples[i]
        img = self.Image.open(path).convert("RGB")
        if self.transform:
            img = self.transform(img)
        risk = self.class_to_risk[target]
        return img, risk

    @property
    def classes(self) -> list[str]:
        return list(self.class_to_idx.keys())


def build_et_dataset(
    root: Optional[Path | str] = None,
    transform=None,
    severities: Optional[list[str]] = None,
) -> ETSeverityDataset:
    """Build ET severity dataset from root/{low,mild,medium,high}/images."""
    return ETSeverityDataset(
        root=root,
        transform=transform or DEFAULT_TRANSFORM,
        severities=severities,
    )


def get_dataloader(
    root: Optional[Path | str] = None,
    batch_size: int = 32,
    num_workers: int = 0,
    train: bool = True,
    **kwargs,
) -> DataLoader:
    """
    Return DataLoader for ET severity images.
    Each batch yields (images, risk_scores).
    """
    transform = DEFAULT_TRANSFORM_TRAIN if train else DEFAULT_TRANSFORM
    dataset = build_et_dataset(root=root, transform=transform)
    return DataLoader(
        dataset,
        batch_size=batch_size,
        shuffle=train,
        num_workers=num_workers,
        **kwargs,
    )
