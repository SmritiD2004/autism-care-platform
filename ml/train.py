"""
Train PyTorch CNN on Zenodo ET ASD Severity dataset.

Usage:
  python -m ml.train --epochs 5
  python ml/train.py --data datasets/eyes --epochs 10
"""

from __future__ import annotations

import argparse
from pathlib import Path

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, random_split

PROJECT_ROOT = Path(__file__).resolve().parent.parent


def get_model(output_dim: int = 1) -> nn.Module:
    """Simple CNN for eye image severity → risk score regression."""
    return nn.Sequential(
        nn.Conv2d(3, 32, 3, padding=1),
        nn.ReLU(),
        nn.MaxPool2d(2),
        nn.Conv2d(32, 64, 3, padding=1),
        nn.ReLU(),
        nn.MaxPool2d(2),
        nn.Conv2d(64, 128, 3, padding=1),
        nn.ReLU(),
        nn.AdaptiveAvgPool2d(1),
        nn.Flatten(),
        nn.Linear(128, 64),
        nn.ReLU(),
        nn.Dropout(0.5),
        nn.Linear(64, output_dim),
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=str, default=str(PROJECT_ROOT / "datasets" / "eyes"))
    parser.add_argument("--epochs", type=int, default=5)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=1e-3)
    parser.add_argument("--save", type=str, default=str(Path(__file__).parent / "et_cnn.pt"))
    parser.add_argument("--val-split", type=float, default=0.2)
    args = parser.parse_args()

    sys_path = str(Path(__file__).parent.parent)
    if sys_path not in __import__("sys").path:
        __import__("sys").path.insert(0, sys_path)

    from datasets.eyes.loader import build_et_dataset, DEFAULT_TRANSFORM_TRAIN, DEFAULT_TRANSFORM

    dataset = build_et_dataset(root=args.data, transform=DEFAULT_TRANSFORM_TRAIN)
    if len(dataset) == 0:
        print("No data found. Run: python datasets/eyes/download_zenodo_et.py")
        return

    val_size = int(len(dataset) * args.val_split)
    train_size = len(dataset) - val_size
    train_ds, val_ds = random_split(
        dataset,
        [train_size, val_size],
        generator=torch.Generator().manual_seed(42),
    )

    train_loader = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_ds, batch_size=args.batch_size, shuffle=False)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = get_model(output_dim=1).to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=args.lr)
    criterion = nn.MSELoss()

    for epoch in range(args.epochs):
        model.train()
        train_loss = 0.0
        n = 0
        for images, targets in train_loader:
            images = images.to(device)
            targets = targets.to(device).float().unsqueeze(1)
            optimizer.zero_grad()
            pred = model(images)
            loss = criterion(pred, targets)
            loss.backward()
            optimizer.step()
            train_loss += loss.item()
            n += 1
        train_loss /= max(n, 1)

        model.eval()
        val_loss = 0.0
        nv = 0
        with torch.no_grad():
            for images, targets in val_loader:
                images = images.to(device)
                targets = targets.to(device).float().unsqueeze(1)
                pred = model(images)
                loss = criterion(pred, targets)
                val_loss += loss.item()
                nv += 1
        val_loss /= max(nv, 1)

        print(f"Epoch {epoch+1}/{args.epochs}  train_loss={train_loss:.4f}  val_loss={val_loss:.4f}")

    Path(args.save).parent.mkdir(parents=True, exist_ok=True)
    torch.save({"model": model.state_dict(), "output_dim": 1}, args.save)
    print(f"Saved to {args.save}")


if __name__ == "__main__":
    main()
